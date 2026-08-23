/**
 * @jest-environment jsdom
 */

describe('Mobile Navigation Toggle functionality', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <header class="site-header">
        <div class="nav-container">
          <nav class="nav">
            <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
            <ul class="nav-links">
              <li><a href="#about">About</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <div id="outside-element">Outside content</div>
    `;

    // Global mocks
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
    window.requestAnimationFrame = jest.fn((cb) => cb());
    window.cancelAnimationFrame = jest.fn();

    // Mock anime
    window.anime = jest.fn(() => ({}));
    window.anime.stagger = jest.fn();
    window.anime.set = jest.fn();
    window.anime.timeline = jest.fn(() => ({ add: jest.fn().mockReturnThis() }));
    window.anime.random = jest.fn();
    window.anime.remove = jest.fn();

    jest.resetModules();
    require('../assets/main.js');
  });

  it('should toggle open/active classes and aria-expanded on click', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    expect(navLinks.classList.contains('open')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    expect(navToggle.classList.contains('active')).toBe(false);

    // Open menu
    navToggle.click();
    expect(navLinks.classList.contains('open')).toBe(true);
    expect(navLinks.classList.contains('active')).toBe(true);
    expect(navToggle.classList.contains('active')).toBe(true);
    expect(navToggle.getAttribute('aria-expanded')).toBe('true');

    // Close menu
    navToggle.click();
    expect(navLinks.classList.contains('open')).toBe(false);
    expect(navLinks.classList.contains('active')).toBe(false);
    expect(navToggle.classList.contains('active')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close when clicking outside the menu', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const outside = document.getElementById('outside-element');

    // Open menu
    navToggle.click();
    expect(navLinks.classList.contains('open')).toBe(true);

    // Click outside
    outside.click();
    expect(navLinks.classList.contains('open')).toBe(false);
    expect(navToggle.classList.contains('active')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close when pressing Escape key', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Open menu
    navToggle.click();
    expect(navLinks.classList.contains('open')).toBe(true);

    // Press Escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(navLinks.classList.contains('open')).toBe(false);
    expect(navToggle.classList.contains('active')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close when clicking an internal nav link', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const firstLink = navLinks.querySelector('a');

    // Open menu
    navToggle.click();
    expect(navLinks.classList.contains('open')).toBe(true);

    // Click a link
    firstLink.click();
    expect(navLinks.classList.contains('open')).toBe(false);
    expect(navToggle.classList.contains('active')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });
});
