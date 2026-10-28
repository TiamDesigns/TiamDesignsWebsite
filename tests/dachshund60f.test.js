/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Dachshund60F Project Page', () => {
  let pageHtml;
  let indexHtml;

  beforeAll(() => {
    pageHtml = fs.readFileSync(path.join(__dirname, '..', 'dachshund60f.html'), 'utf8');
    indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  });

  it('links to the page from a project card on the home page', () => {
    document.documentElement.innerHTML = indexHtml;
    const card = document.querySelector('.project-card.dachshund60f');
    expect(card).not.toBeNull();
    expect(card.querySelector('a').getAttribute('href')).toBe('dachshund60f.html');
  });

  it('states in the hero that PCBs have not been ordered', () => {
    document.documentElement.innerHTML = pageHtml;
    const status = document.querySelector('.hero-content .hero-team-credits');
    expect(status).not.toBeNull();
    expect(status.textContent).toContain('No PCBs have been ordered yet');
  });

  it('covers the encoder and gasket issues caught in review', () => {
    document.documentElement.innerHTML = pageHtml;
    const text = document.body.textContent;
    expect(text).toContain('Wrong Encoder Orientation');
    expect(text).toContain('A Button You Couldn');
    expect(text).toContain('Gasket Visual Issues');
  });

  it('references only image and model files that exist', () => {
    document.documentElement.innerHTML = pageHtml;
    const refs = [
      ...[...document.querySelectorAll('img')].map((img) => img.getAttribute('src')),
      ...[...document.querySelectorAll('source')].map((source) => source.getAttribute('srcset')),
    ].filter((ref) => ref.startsWith('assets/'));
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => {
      expect(fs.existsSync(path.join(__dirname, '..', ref))).toBe(true);
    });

    const viewer = fs.readFileSync(path.join(__dirname, '..', 'assets', 'dachshund-3d.js'), 'utf8');
    const model = viewer.match(/'(assets\/Dachshund60F\/[^']+\.glb)'/)[1];
    expect(fs.existsSync(path.join(__dirname, '..', model))).toBe(true);
  });
});
