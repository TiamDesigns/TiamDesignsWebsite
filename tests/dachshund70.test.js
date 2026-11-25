/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Dachshund70 Project Page', () => {
  let pageHtml;
  let indexHtml;

  beforeAll(() => {
    pageHtml = fs.readFileSync(path.join(__dirname, '..', 'dachshund70.html'), 'utf8');
    indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  });

  it('links to the page from a project card on the home page', () => {
    document.documentElement.innerHTML = indexHtml;
    const card = document.querySelector('.project-card.dachshund70');
    expect(card).not.toBeNull();
    expect(card.querySelector('a').getAttribute('href')).toBe('dachshund70.html');
    expect(card.querySelector('img').getAttribute('src')).toBe('assets/Dachshund70/card-thumb.jpg');
  });

  it('redirects the old Dachshund60F address to the new page', () => {
    const redirects = fs.readFileSync(path.join(__dirname, '..', '_redirects'), 'utf8');
    expect(redirects).toContain('/dachshund60f.html /dachshund70.html 301');
  });

  it('states in the hero that PCBs have not been ordered', () => {
    document.documentElement.innerHTML = pageHtml;
    const status = document.querySelector('.hero-content .hero-team-credits');
    expect(status).not.toBeNull();
    expect(status.textContent).toContain('No PCBs have been ordered yet');
  });

  it('covers the issues caught in review', () => {
    document.documentElement.innerHTML = pageHtml;
    const catches = document.querySelector('#catches').textContent;
    expect(catches).toContain('Wrong Encoder Orientation');
    expect(catches).toContain('A Button You Couldn');
    expect(catches).toContain('Gaskets Facing the Wrong Way');
    expect(catches).toContain('A Case You Couldn');
    expect(catches).toContain('Screw Heads Standing Proud');
  });

  it('lays out the next steps in a schedule section', () => {
    document.documentElement.innerHTML = pageHtml;
    const steps = document.querySelectorAll('#schedule .lifecycle-step');
    expect(steps.length).toBe(4);
    expect(steps[0].textContent).toContain('Order PCBs');
    expect(steps[3].textContent).toContain('Final assembly');
  });

  it('references only image files that exist', () => {
    document.documentElement.innerHTML = pageHtml;
    const refs = [
      ...[...document.querySelectorAll('img')].map((img) => img.getAttribute('src')),
      ...[...document.querySelectorAll('source')].map((source) => source.getAttribute('srcset')),
    ].filter((ref) => ref.startsWith('assets/'));
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => {
      expect(fs.existsSync(path.join(__dirname, '..', ref))).toBe(true);
    });
  });
});
