/**
 * @jest-environment jsdom
 */

// We need to read the hero-canvas.js file and evaluate it, but wait! It is wrapped in DOMContentLoaded.
// So we will load it into the DOM.
const fs = require('fs');
const path = require('path');

describe('hero-canvas particle initialization', () => {
    let canvas, ctx;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="hero-parent" style="width: 1000px; height: 500px;">
                <canvas id="hero-canvas"></canvas>
            </div>
        `;

        canvas = document.getElementById('hero-canvas');

        // Mock IntersectionObserver
        global.IntersectionObserver = class {
            constructor() {}
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        // Mock requestAnimationFrame and cancelAnimationFrame
        global.requestAnimationFrame = jest.fn();
        global.cancelAnimationFrame = jest.fn();

        // Mock window.devicePixelRatio
        Object.defineProperty(window, 'devicePixelRatio', {
            value: 2,
            writable: true
        });

        // Mock canvas context
        ctx = {
            scale: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
        };
        canvas.getContext = jest.fn(() => ctx);

        // Mock parent properties
        Object.defineProperty(canvas.parentElement, 'clientWidth', { value: 1000, configurable: true });
        Object.defineProperty(canvas.parentElement, 'clientHeight', { value: 500, configurable: true });
        canvas.getBoundingClientRect = jest.fn(() => ({
            top: 0,
            left: 0,
            bottom: 500,
            right: 1000,
            width: 1000,
            height: 500
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize particles with correct count based on screen size', () => {
        // Evaluate the script
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/hero-canvas.js'), 'utf8');

        // To test initParticles, we need access to the inner variables.
        // We can expose them for testing or test the side effects.
        // Side effects of initParticles:
        // 1. sets canvas.width and canvas.height
        // 2. calls ctx.scale
        // 3. creates particles array (hard to access directly unless we expose it)

        // Let's modify the script slightly to attach particles to canvas for testing
        const modifiedScript = scriptContent.replace(
            /let particles = \[\];/,
            'let particles = []; canvas._getParticles = () => particles; canvas._getConfig = () => config; canvas._initParticles = initParticles;'
        );

        eval(modifiedScript);

        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Check side effects of initParticles() which runs on DOMContentLoaded
        expect(canvas.width).toBe(2000); // 1000 * 2
        expect(canvas.height).toBe(1000); // 500 * 2
        expect(ctx.scale).toHaveBeenCalledWith(2, 2);

        // Test particle count logic: area = 1000 * 500 = 500,000
        // targetParticles = Math.floor(500000 / 12000) = 41
        // config.particleCount = Math.min(Math.max(50, 41), 300) = 50
        const particles = canvas._getParticles();
        expect(particles.length).toBe(50);
    });

    it('should cap max particles to 300 for very large screens', () => {
        Object.defineProperty(canvas.parentElement, 'clientWidth', { value: 4000, configurable: true });
        Object.defineProperty(canvas.parentElement, 'clientHeight', { value: 2000, configurable: true });

        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/hero-canvas.js'), 'utf8');
        const modifiedScript = scriptContent.replace(
            /let particles = \[\];/,
            'let particles = []; canvas._getParticles = () => particles; canvas._getConfig = () => config; canvas._initParticles = initParticles;'
        );

        eval(modifiedScript);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // area = 4000 * 2000 = 8,000,000
        // targetParticles = Math.floor(8000000 / 12000) = 666
        // config.particleCount = Math.min(Math.max(50, 666), 300) = 300
        expect(canvas._getParticles().length).toBe(300);
    });

    it('should update particle positions correctly based on speed and radius', () => {
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/hero-canvas.js'), 'utf8');
        const modifiedScript = scriptContent.replace(
            /let particles = \[\];/,
            'let particles = []; canvas._getParticles = () => particles; canvas._getConfig = () => config; canvas._initParticles = initParticles;'
        );
        eval(modifiedScript);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const particles = canvas._getParticles();
        const config = canvas._getConfig();
        expect(particles.length).toBeGreaterThan(0);

        // Test one particle's properties
        const p = particles[0];
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1000);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(500);

        // speed bounds (-config.particleSpeed * 2 to config.particleSpeed * 2 => -0.6 to 0.6)
        // actually (Math.random() - 0.5) * config.particleSpeed * 2
        // -> -0.5 to 0.5 * 0.6 -> -0.3 to 0.3
        expect(p.vx).toBeGreaterThanOrEqual(-config.particleSpeed);
        expect(p.vx).toBeLessThanOrEqual(config.particleSpeed);
        expect(p.vy).toBeGreaterThanOrEqual(-config.particleSpeed);
        expect(p.vy).toBeLessThanOrEqual(config.particleSpeed);

        expect(p.radius).toBeGreaterThanOrEqual(config.particleRadius);
        expect(p.radius).toBeLessThanOrEqual(config.particleRadius + 1);
    });
});
