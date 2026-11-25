// Checks the built site in dist/ (run `npm run build` first):
//   1. Every local link, image, script, stylesheet and download points at a
//      file that exists, so a renamed asset can't ship as a broken link.
//   2. Every <img> has an alt attribute.
//   3. Images that load as part of a page stay under a size budget. Files
//      people download on purpose (CAD, PDFs, spreadsheets, full-res renders
//      linked with <a href>) are not counted.
// Any problem fails the check. Pass --warn-images to report budget overruns
// as warnings instead, e.g. while a big render is being re-exported.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const args = process.argv.slice(2);
const root = path.resolve(__dirname, '..', args.find(a => !a.startsWith('-')) || 'dist');
const strict = !args.includes('--warn-images');
const IMAGE_BUDGET_BYTES = 1024 * 1024; // 1 MB per image shown on a page

const errors = [];
const warnings = [];

const redirects = new Set();
const redirectsFile = path.join(root, '_redirects');
if (fs.existsSync(redirectsFile)) {
  for (const line of fs.readFileSync(redirectsFile, 'utf8').split('\n')) {
    const from = line.trim().split(/\s+/)[0];
    if (from && !from.startsWith('#')) redirects.add(from);
  }
}

function resolveLocal(page, url) {
  if (!url) return null;
  url = url.trim();
  if (/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(url)) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  let decoded;
  try { decoded = decodeURIComponent(clean); } catch { decoded = clean; }
  const base = decoded.startsWith('/') ? root : path.dirname(path.join(root, page));
  return { url: clean, file: path.join(base, decoded) };
}

function exists(target) {
  if (redirects.has(target.url) || redirects.has('/' + target.url)) return true;
  if (fs.existsSync(target.file)) {
    if (fs.statSync(target.file).isDirectory()) return fs.existsSync(path.join(target.file, 'index.html'));
    return true;
  }
  // Cloudflare Pages serves /page as /page.html
  return fs.existsSync(target.file + '.html');
}

const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
if (!pages.length) {
  console.error(`No HTML pages found in ${root}. Run \`npm run build\` first.`);
  process.exit(1);
}

for (const page of pages) {
  const doc = new JSDOM(fs.readFileSync(path.join(root, page), 'utf8')).window.document;
  const shown = new Set();

  const check = (el, attr, url, isShownImage) => {
    const target = resolveLocal(page, url);
    if (!target) return;
    if (!exists(target)) {
      errors.push(`${page}: <${el.tagName.toLowerCase()} ${attr}="${url}"> points at a missing file`);
    } else if (isShownImage && fs.existsSync(target.file)) {
      shown.add(target.file);
    }
  };

  doc.querySelectorAll('[href]').forEach(el => {
    if (el.tagName === 'LINK' && /preconnect|dns-prefetch/.test(el.rel)) return;
    check(el, 'href', el.getAttribute('href'), false);
  });
  doc.querySelectorAll('[src]').forEach(el => check(el, 'src', el.getAttribute('src'), el.tagName === 'IMG'));
  doc.querySelectorAll('[poster]').forEach(el => check(el, 'poster', el.getAttribute('poster'), true));
  doc.querySelectorAll('[srcset]').forEach(el => {
    el.getAttribute('srcset').split(',').forEach(c => {
      const url = c.trim().replace(/\s+\d+(\.\d+)?[wx]$/, '');
      check(el, 'srcset', url, true);
    });
  });

  doc.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('alt')) {
      errors.push(`${page}: <img src="${img.getAttribute('src')}"> has no alt text (use alt="" for decorative images)`);
    }
  });

  // An <img> inside a <picture> with smaller sources is a fallback most
  // browsers never download, so only budget the sources in that case.
  doc.querySelectorAll('picture > source[srcset] ~ img[src]').forEach(img => {
    const target = resolveLocal(page, img.getAttribute('src'));
    if (target) shown.delete(target.file);
  });

  for (const file of shown) {
    const size = fs.statSync(file).size;
    if (size > IMAGE_BUDGET_BYTES) {
      const msg = `${page}: ${path.relative(root, file)} is ${(size / 1048576).toFixed(1)} MB (budget ${IMAGE_BUDGET_BYTES / 1048576} MB). Export a WebP or a smaller size for the page and link the full file as a download.`;
      (strict ? errors : warnings).push(msg);
    }
  }
}

for (const w of warnings) console.log(`::warning::${w}`);
for (const e of errors) console.log(`::error::${e}`);
console.log(`Checked ${pages.length} pages: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
