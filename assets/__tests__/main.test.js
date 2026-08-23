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

  it('should set active class, pointerEvents, and lock body scroll on open', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightbox = document.getElementById('lightbox');

    testImg.click();

    expect(lightbox.classList.contains('active')).toBe(true);
    expect(lightbox.style.pointerEvents).toBe('auto');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should close on close button click and unlock body scroll', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');

    testImg.click();
    expect(lightbox.style.display).toBe('flex');
    expect(lightbox.classList.contains('active')).toBe(true);

    closeBtn.click();
    expect(lightbox.style.display).toBe('none');
    expect(lightbox.classList.contains('active')).toBe(false);
    expect(lightbox.style.pointerEvents).toBe('none');
    expect(document.body.style.overflow).toBe('');
  });

  it('should close on backdrop click outside content', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightbox = document.getElementById('lightbox');

    testImg.click();
    expect(lightbox.style.display).toBe('flex');

    // Clicking directly on lightbox backdrop
    lightbox.click();
    expect(lightbox.style.display).toBe('none');
    expect(lightbox.classList.contains('active')).toBe(false);
  });

  it('should close when pressing the Escape key', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightbox = document.getElementById('lightbox');

    testImg.click();
    expect(lightbox.style.display).toBe('flex');

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(lightbox.style.display).toBe('none');
    expect(lightbox.classList.contains('active')).toBe(false);
  });

  it('should zoom in and out with zoom controls', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightboxImg = document.getElementById('lightbox-img');
    const zoomInBtn = document.getElementById('lightbox-zoom-in');
    const zoomOutBtn = document.getElementById('lightbox-zoom-out');

    testImg.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(1)');

    // Zoom in once -> 1.5
    zoomInBtn.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(1.5)');
    expect(lightboxImg.style.cursor).toBe('grab');

    // Zoom in again -> 2
    zoomInBtn.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(2)');

    // Zoom out -> 1.5
    zoomOutBtn.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(1.5)');

    // Zoom out -> 1
    zoomOutBtn.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(1)');
    expect(lightboxImg.style.cursor).toBe('default');

    // Further zoom out should not decrease below 1
    zoomOutBtn.click();
    expect(lightboxImg.style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('should pan image when dragging if zoomed in', () => {
    window.anime = undefined;
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    const testImg = document.getElementById('test-img');
    const lightboxImg = document.getElementById('lightbox-img');
    const zoomInBtn = document.getElementById('lightbox-zoom-in');

    testImg.click();

    // Try to drag without zoom -> should not drag
    const mousedownEvent1 = new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true });
    lightboxImg.dispatchEvent(mousedownEvent1);
    expect(lightboxImg.style.cursor).toBe('default');

    // Zoom in
    zoomInBtn.click();
    expect(lightboxImg.style.cursor).toBe('grab');

    // Drag when zoomed
    const mousedownEvent2 = new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true });
    lightboxImg.dispatchEvent(mousedownEvent2);
    expect(lightboxImg.style.cursor).toBe('grabbing');

    const mousemoveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 120, bubbles: true });
    window.dispatchEvent(mousemoveEvent);
    expect(lightboxImg.style.transform).toBe('translate(50px, 20px) scale(1.5)');

    const mouseupEvent = new MouseEvent('mouseup', { bubbles: true });
    window.dispatchEvent(mouseupEvent);
    expect(lightboxImg.style.cursor).toBe('grab');
  });
});

describe('initElasticOverscroll functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div style="height: 2000px;">Content</div>`;
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
    Object.defineProperty(document.body, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.body, 'offsetHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'offsetHeight', { value: 2000, configurable: true });
    window.scrollY = 0;

    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
    window.requestAnimationFrame = jest.fn((cb) => cb());
    window.cancelAnimationFrame = jest.fn();

    jest.resetModules();
    require('../main.js');

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
  });

  it('should preserve native scrolling without blocking wheel events', () => {
    const wheelEvent = new WheelEvent('wheel', { deltaY: 50, cancelable: true });
    const preventDefaultSpy = jest.spyOn(wheelEvent, 'preventDefault');

    document.dispatchEvent(wheelEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(document.body.style.transform).toBe('');
  });
});

