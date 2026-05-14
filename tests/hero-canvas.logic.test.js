const { _updateParticlesLogic } = require('../assets/hero-canvas.js');

describe('updateParticlesLogic', () => {
    let particles, config, mouse, width, height;

    beforeEach(() => {
        width = 800;
        height = 600;
        config = {
            mouseRepelDistance: 100,
            mouseForce: 0.03,
            particleSpeed: 0.3
        };
        mouse = { x: -1000, y: -1000, isActive: false };
        particles = [
            { x: 100, y: 100, vx: 0.5, vy: 0.5 }
        ];
    });

    it('moves a particle based on its velocity', () => {
        _updateParticlesLogic(particles, width, height, mouse, config);

        // It moves and applies friction/damping since velocity 0.707 > 0.3
        // So vx becomes 0.5 * 0.98 = 0.49
        // The movement happens before friction
        expect(particles[0].x).toBeCloseTo(100.5);
        expect(particles[0].y).toBeCloseTo(100.5);
    });

    it('bounces particle off the left and right edges', () => {
        particles[0].x = -10; // Left edge
        particles[0].vx = -0.5;

        _updateParticlesLogic(particles, width, height, mouse, config);
        // Bounces: vx *= -1 -> becomes 0.5. Then movement already happened. Wait, movement happens FIRST.
        // Actually:
        // p.x += p.vx (-10 + -0.5 = -10.5)
        // if (p.x < 0) p.vx *= -1 (vx = 0.5)
        // p.x = Math.max(0, Math.min(width, p.x)) (x = 0)
        expect(particles[0].x).toBe(0);
        // After friction, vx becomes 0.5 * 0.98 = 0.49
        expect(particles[0].vx).toBeCloseTo(0.49);

        particles[0].x = 810; // Right edge
        particles[0].vx = 0.5;

        _updateParticlesLogic(particles, width, height, mouse, config);
        expect(particles[0].x).toBe(800);
        expect(particles[0].vx).toBeCloseTo(-0.49); // 0.5 * -1 * 0.98
    });

    it('bounces particle off the top and bottom edges', () => {
        particles[0].y = -10; // Top edge
        particles[0].vy = -0.5;

        _updateParticlesLogic(particles, width, height, mouse, config);
        expect(particles[0].y).toBe(0);
        expect(particles[0].vy).toBeCloseTo(0.49);

        particles[0].y = 610; // Bottom edge
        particles[0].vy = 0.5;

        _updateParticlesLogic(particles, width, height, mouse, config);
        expect(particles[0].y).toBe(600);
        expect(particles[0].vy).toBeCloseTo(-0.49);
    });

    it('repels particle from mouse if active and within range', () => {
        particles[0] = { x: 100, y: 100, vx: 0, vy: 0 };
        mouse = { x: 100, y: 150, isActive: true }; // Distance 50 (within 100)

        _updateParticlesLogic(particles, width, height, mouse, config);

        // dy is -50
        // forceDirectionY = -1
        // force = (100 - 50) / 100 = 0.5
        // vy += -1 * 0.5 * 0.03 = -0.015

        expect(particles[0].vy).toBeLessThan(0); // Pushed upwards (away from mouse)
    });

    it('does not repel if mouse is inactive', () => {
        particles[0] = { x: 100, y: 100, vx: 0, vy: 0 };
        mouse = { x: 100, y: 150, isActive: false };

        _updateParticlesLogic(particles, width, height, mouse, config);

        expect(particles[0].vx).toBe(0); // Nudge happens later but base speed is 0... actually speed < 0.15 so it gets multiplied by 1.02. 0 * 1.02 = 0
        expect(particles[0].vy).toBe(0);
    });

    it('does not repel if mouse is outside repel distance', () => {
        particles[0] = { x: 100, y: 100, vx: 0, vy: 0 };
        mouse = { x: 100, y: 300, isActive: true }; // Distance 200 (outside 100)

        _updateParticlesLogic(particles, width, height, mouse, config);

        expect(particles[0].vx).toBe(0);
        expect(particles[0].vy).toBe(0);
    });

    it('applies damping if moving too fast', () => {
        particles[0] = { x: 100, y: 100, vx: 1, vy: 0 };

        _updateParticlesLogic(particles, width, height, mouse, config);

        expect(particles[0].vx).toBeCloseTo(0.98); // 1 * 0.98
    });

    it('nudges speed up if moving too slow', () => {
        particles[0] = { x: 100, y: 100, vx: 0.1, vy: 0 }; // Speed 0.1, less than 0.3 * 0.5 = 0.15

        _updateParticlesLogic(particles, width, height, mouse, config);

        expect(particles[0].vx).toBeCloseTo(0.102); // 0.1 * 1.02
    });
});
