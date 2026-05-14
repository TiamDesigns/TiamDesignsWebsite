/**
 * @jest-environment jsdom
 */

describe('openLightbox functionality', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="gallery-grid">
        <figure>
          <img id="test-img" src="test.jpg" alt="Test Alt Text" class="feature-image">
          <figcaption>Test Caption Text</figcaption>
        </figure>
      </div>
      <div class="gallery-grid">
        <figure>
          <img id="test-img-no-caption" src="test-nocaption.jpg" alt="Test Alt Text No Caption" class="feature-image">
        </figure>
      </div>
    `;

    // Global mocks
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
    window.requestAnimationFrame = jest.fn();
    window.cancelAnimationFrame = jest.fn();

    // Force script to reload and bind events
    jest.resetModules();
  });

  it('should call anime if available and set image source and caption correctly', () => {
    // Mock anime
    window.anime = jest.fn((config) => {
      // Simulate the begin callback immediately for lightbox
      if (config.begin) {
        config.begin();
      }
    });
    window.anime.stagger = jest.fn();
    window.anime.set = jest.fn();
    window.anime.timeline = jest.fn(() => ({ add: jest.fn().mockReturnThis() }));
    window.anime.random = jest.fn();
    window.anime.remove = jest.fn();

    // Load main.js
    require('../main.js');

    // Trigger DOMContentLoaded so that main.js creates the lightbox
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');

    // Clear previous anime calls during init
    window.anime.mockClear();

    // Click the image to open lightbox
    testImg.click();

    expect(window.anime).toHaveBeenCalledWith(expect.objectContaining({
      targets: lightbox,
      opacity: [0, 1]
    }));

    expect(lightbox.style.display).toBe('flex');
    expect(lightboxImg.src).toContain('test.jpg');
    expect(lightboxImg.alt).toBe('Test Alt Text');
    expect(captionText.textContent).toBe('Test Caption Text');
  });

  it('should fallback to direct DOM manipulation if anime is undefined', () => {
    // Remove anime
    window.anime = undefined;

    // Load main.js
    require('../main.js');

    // Trigger DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImgNoCaption = document.getElementById('test-img-no-caption');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');

    testImgNoCaption.click();

    expect(lightbox.style.display).toBe('flex');
    expect(lightbox.style.opacity).toBe('1');
    expect(lightboxImg.src).toContain('test-nocaption.jpg');
    expect(lightboxImg.alt).toBe('Test Alt Text No Caption');
    expect(captionText.textContent).toBe('Test Alt Text No Caption'); // Fallback to alt
  });
});
