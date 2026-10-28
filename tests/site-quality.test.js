/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const stylesCss = fs.readFileSync(path.join(root, 'assets', 'styles.css'), 'utf8');

describe('Site quality guards', () => {
  describe.each(pages)('%s', (page) => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');

    it('encodes spaces in srcset URLs so WebP sources are not discarded', () => {
      document.documentElement.innerHTML = html;
      document.querySelectorAll('[srcset]').forEach(el => {
        el.getAttribute('srcset').split(',').forEach(candidate => {
          const url = candidate.trim().replace(/\s+\d+(\.\d+)?[wx]$/, '');
          expect(url).not.toMatch(/\s/);
        });
      });
    });

    it('has a social preview image and description', () => {
      expect(html).toMatch(/<meta property="og:image" content="https:\/\/[^"]+"/);
      expect(html).toMatch(/<meta name="description"\s+content="[^"]+"/);
    });

    it('does not disable caching with meta tags', () => {
      expect(html).not.toMatch(/http-equiv="(Cache-Control|Pragma|Expires)"/);
    });
  });

  it('honours prefers-reduced-motion in CSS', () => {
    expect(stylesCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
