const fs = require('fs');
const path = require('path');

describe('Lightbox functionality', () => {
  let lightbox;
  let lightboxImg;
  let closeBtn;

  beforeAll(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="gallery-grid">
        <figure>
          <img class="test-img" src="test.jpg" alt="Test Image">
          <figcaption>Test Caption</figcaption>
        </figure>
      </div>
    `;

    // Clear global anime mock if it exists
    if (global.anime) {
      delete global.anime;
    }

    // Clear require cache for main.js to allow re-evaluating if we were requiring it
    jest.resetModules();
  });

  function setupLightbox(withAnime = false) {
    if (withAnime) {
      // Mock anime
      global.anime = jest.fn((options) => {
        return options;
      });
      // We also need to mock anime.stagger
      global.anime.stagger = jest.fn();
      global.anime.timeline = jest.fn(() => ({
          add: jest.fn().mockReturnThis()
      }));
      global.anime.set = jest.fn();
      global.anime.remove = jest.fn();
      global.anime.random = jest.fn();
    } else {
      delete global.anime;
    }

    const mainJsCode = fs.readFileSync(path.resolve(__dirname, '../assets/main.js'), 'utf8');

    // We wrap the code in a function to isolate its scope
    const scriptFunc = new Function(mainJsCode);
    scriptFunc();

    // Dispatch DOMContentLoaded to trigger event listeners attached by the script
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    lightbox = document.getElementById('lightbox');
    lightboxImg = document.getElementById('lightbox-img');
    closeBtn = document.getElementById('lightbox-close');

    // Open the lightbox by clicking an image
    const img = document.querySelector('.test-img');
    img.click();

    // If anime is mocked, call the 'begin' callback to finish opening
    if (withAnime && global.anime.mock.calls.length > 0) {
      const openCall = global.anime.mock.calls.find(call => call[0] && call[0].targets === lightbox && call[0].opacity && call[0].opacity[1] === 1);
      if (openCall && openCall[0].begin) {
        openCall[0].begin();
      }
    }
  }

  afterEach(() => {
    // Clean up body
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('closeLightbox should hide lightbox when anime is NOT defined', () => {
    setupLightbox(false);

    // Verify it's open
    expect(lightbox.style.display).toBe('flex');
    expect(lightboxImg.src).toContain('test.jpg');

    // Click close
    closeBtn.click();

    // Verify it's closed
    expect(lightbox.style.display).toBe('none');
  });

  test('closeLightbox should animate hiding when anime IS defined', () => {
    setupLightbox(true);

    // Verify it's open
    expect(lightbox.style.display).toBe('flex');
    expect(lightboxImg.src).toContain('test.jpg');

    // Clear previous mock calls from opening
    global.anime.mockClear();

    // Click close
    closeBtn.click();

    // Verify anime was called with correct parameters
    expect(global.anime).toHaveBeenCalled();

    // Find the call for closing lightbox
    const callOptions = global.anime.mock.calls.find(call => call[0] && call[0].targets === lightbox && call[0].opacity === 0)[0];
    expect(callOptions).toBeDefined();

    expect(callOptions.targets).toBe(lightbox);
    expect(callOptions.opacity).toBe(0);
    expect(callOptions.duration).toBe(300);
    expect(callOptions.easing).toBe('easeOutQuad');

    // The display and src aren't reset until the complete callback
    expect(lightbox.style.display).toBe('flex');
    expect(lightboxImg.src).toContain('test.jpg');

    // Manually trigger the complete callback
    callOptions.complete();

    // Verify changes applied by complete callback
    expect(lightbox.style.display).toBe('none');
    expect(lightboxImg.src).toBe('http://localhost/'); // JS sets to '' but JSDOM resolves to base URL
  });

  test('closeLightbox should be triggered by Escape key', () => {
    setupLightbox(false);
    expect(lightbox.style.display).toBe('flex');

    // Dispatch Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(lightbox.style.display).toBe('none');
  });

  test('closeLightbox should be triggered by clicking on the overlay', () => {
    setupLightbox(false);
    expect(lightbox.style.display).toBe('flex');

    // Click on the overlay (not its children)
    lightbox.click();

    expect(lightbox.style.display).toBe('none');
  });

  test('closeLightbox should NOT be triggered by clicking inside the overlay content', () => {
    setupLightbox(false);
    expect(lightbox.style.display).toBe('flex');

    // Click on the image inside the lightbox
    lightboxImg.click();

    // Should still be open
    expect(lightbox.style.display).toBe('flex');
  });
});
