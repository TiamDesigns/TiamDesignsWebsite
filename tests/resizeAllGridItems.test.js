const fs = require('fs');
const path = require('path');

describe('Masonry Layout functions', () => {
  let mockRequestAnimationFrame;
  let mockCancelAnimationFrame;

  beforeEach(() => {
    // Reset document body
    document.body.innerHTML = `
      <div class="gallery-grid">
        <figure class="item1">
          <img>
          <figcaption></figcaption>
        </figure>
        <figure class="item2">
          <img>
        </figure>
        <figure class="item3 no-img">
          <!-- no image inside -->
        </figure>
      </div>
      <div class="not-a-grid">
        <figure class="item4">
          <img>
        </figure>
      </div>
    `;

    // Mock requestAnimationFrame and cancelAnimationFrame
    mockRequestAnimationFrame = jest.fn((cb) => {
        return 123; // mock ID
    });
    mockCancelAnimationFrame = jest.fn((id) => clearTimeout(id));
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    window.requestAnimationFrame = mockRequestAnimationFrame;
    window.cancelAnimationFrame = mockCancelAnimationFrame;

    // Set up a window global variable for the script to use
    window.getComputedStyle = jest.fn((element) => {
      if (element.classList.contains('gallery-grid')) {
        return {
          getPropertyValue: (prop) => {
            if (prop === 'grid-auto-rows') return '10';
            if (prop === 'grid-row-gap') return '10';
            if (prop === 'gap') return '10';
            return '0';
          }
        };
      }
      return {
        getPropertyValue: () => '0'
      };
    });

    // Mock getBoundingClientRect
    const img1 = document.querySelector('.item1 img');
    img1.getBoundingClientRect = jest.fn(() => ({ height: 100 }));

    const cap1 = document.querySelector('.item1 figcaption');
    cap1.getBoundingClientRect = jest.fn(() => ({ height: 40 }));

    const img2 = document.querySelector('.item2 img');
    img2.getBoundingClientRect = jest.fn(() => ({ height: 80 }));

    const img4 = document.querySelector('.item4 img');
    img4.getBoundingClientRect = jest.fn(() => ({ height: 50 }));

    // Read the script content
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/main.js'), 'utf8');

    // Create a robust module environment to load main.js safely without brittle regex
    // We mock GSAP and ScrollTrigger which are used globally in main.js
    window.gsap = {
        registerPlugin: jest.fn(),
        to: jest.fn(),
        from: jest.fn(),
        fromTo: jest.fn(),
        timeline: jest.fn(() => ({
            from: jest.fn().mockReturnThis(),
            to: jest.fn().mockReturnThis()
        })),
        utils: {
            toArray: jest.fn(() => [])
        }
    };

    window.ScrollTrigger = {
        refresh: jest.fn(),
        create: jest.fn()
    };

    window.anime = jest.fn();

    // Some basic DOM mocks for things main.js queries on load
    if (!document.getElementById('navToggle')) {
        const navToggle = document.createElement('div');
        navToggle.id = 'navToggle';
        document.body.appendChild(navToggle);
    }

    if (!document.querySelector('.mobile-menu')) {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        document.body.appendChild(mobileMenu);
    }

    if (!document.getElementById('webgl-container')) {
        const webgl = document.createElement('div');
        webgl.id = 'webgl-container';
        document.body.appendChild(webgl);
    }

    // Evaluate the script safely into our test context
    // Instead of parsing, we just evaluate the whole script
    // It will attach the functions to window if we write a small wrapper
    const wrappedScript = `
        // Create an isolated scope but bind the functions we need to window
        (function() {
            ${scriptContent}

            // Export the functions we want to test to the window object
            if (typeof performMasonryLayout !== 'undefined') {
                window.testPerformMasonryLayout = performMasonryLayout;
            }
            if (typeof resizeAllGridItems !== 'undefined') {
                window.testResizeAllGridItems = resizeAllGridItems;
            }
            if (typeof resizeGridItem !== 'undefined') {
                window.testResizeGridItem = resizeGridItem;
            }
        })();
    `;

    // We execute it in the Node.js vm context which shares the JSDOM globals
    const vm = require('vm');
    const context = vm.createContext({
        window: window,
        document: document,
        requestAnimationFrame: global.requestAnimationFrame,
        cancelAnimationFrame: global.cancelAnimationFrame,
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        gsap: window.gsap,
        ScrollTrigger: window.ScrollTrigger,
        anime: window.anime,
        Math: Math,
        Map: Map,
        parseInt: parseInt
    });

    try {
        vm.runInContext(wrappedScript, context);
    } catch (e) {
        console.error("Script execution failed:", e);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('performMasonryLayout', () => {
    it('should correctly calculate gridRowEnd for items with both image and caption', () => {
      window.testPerformMasonryLayout();

      const item1 = document.querySelector('.item1');
      // total height = img(100) + cap(40) = 140
      // rowGap = 10, rowHeight = 10
      // (140 + 10) / (10 + 10) = 150 / 20 = 7.5 -> ceil(7.5) = 8
      expect(item1.style.gridRowEnd).toBe('span 8');
    });

    it('should correctly calculate gridRowEnd for items with only image', () => {
      window.testPerformMasonryLayout();

      const item2 = document.querySelector('.item2');
      // total height = img(80) = 80
      // rowGap = 10, rowHeight = 10
      // (80 + 10) / (10 + 10) = 90 / 20 = 4.5 -> ceil(4.5) = 5
      expect(item2.style.gridRowEnd).toBe('span 5');
    });

    it('should skip items without an image', () => {
      window.testPerformMasonryLayout();

      const item3 = document.querySelector('.item3');
      expect(item3.style.gridRowEnd).toBe(''); // Should not have been set
    });

    it('should skip items not in a gallery-grid', () => {
      window.testPerformMasonryLayout();

      const item4 = document.querySelector('.item4');
      expect(item4.style.gridRowEnd).toBe(''); // Should not have been set
    });

    it('should handle missing grid properties safely', () => {
      // Modify mock to return 0 for grid properties
      window.getComputedStyle.mockImplementationOnce(() => ({
        getPropertyValue: () => '0'
      }));

      // Should not throw or crash
      expect(() => window.testPerformMasonryLayout()).not.toThrow();
    });
  });

  describe('resizeAllGridItems', () => {
    it('should schedule layout using requestAnimationFrame', () => {
      // Clear mocks from script init
      mockRequestAnimationFrame.mockClear();

      window.testResizeAllGridItems();
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
      // Verify performMasonryLayout is passed to requestAnimationFrame
      expect(mockRequestAnimationFrame.mock.calls[0][0].name).toBe('performMasonryLayout');
    });

    it('should cancel existing animation frame if called multiple times', () => {
      // Clear mocks from script init
      mockRequestAnimationFrame.mockClear();
      mockCancelAnimationFrame.mockClear();

      window.testResizeAllGridItems(); // First call schedules

      window.testResizeAllGridItems(); // Second call should cancel the first
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('resizeGridItem', () => {
    it('should call resizeAllGridItems to batch resizes', () => {
      mockRequestAnimationFrame.mockClear();
      window.testResizeGridItem();
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
    });
  });
});
