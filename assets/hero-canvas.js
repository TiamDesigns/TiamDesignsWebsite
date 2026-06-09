// Hero Canvas: Interactive Node Particle Network
// A subtle dark particle network that connects dots and reacts to the cursor

function _updateParticlesLogic(particles, width, height, mouse, config) {
    const repelDistSq = config.mouseRepelDistance * config.mouseRepelDistance;
    const targetSpeedSq = config.particleSpeed * config.particleSpeed;
    const minSpeedSq = (config.particleSpeed * 0.5) * (config.particleSpeed * 0.5);

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Keep within bounds just in case
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Mouse interaction: Repulse
        if (mouse.isActive) {
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let distSq = dx * dx + dy * dy;

            if (distSq < repelDistSq && distSq > 0) {
                let dist = Math.sqrt(distSq);
                let forceDirectionX = dx / dist;
                let forceDirectionY = dy / dist;
                let force = (config.mouseRepelDistance - dist) / config.mouseRepelDistance;

                p.vx += forceDirectionX * force * config.mouseForce;
                p.vy += forceDirectionY * force * config.mouseForce;
            }
        }

        // Apply friction/damping to return to base speed
        let currentSpeedSq = p.vx * p.vx + p.vy * p.vy;
        if (currentSpeedSq > targetSpeedSq) {
            p.vx *= 0.98;
            p.vy *= 0.98;
        } else if (currentSpeedSq < minSpeedSq) {
            // Gentle nudge if too slow
            p.vx *= 1.02;
            p.vy *= 1.02;
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { _updateParticlesLogic };
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });

    // Config
    const config = {
        particleCount: 150, // Number of particles
        particleRadius: 1.5,
        particleColor: 'rgba(255, 255, 255, 0.4)',
        linkColor: 'rgba(255, 255, 255, 0.15)',
        accentColor: 'rgba(56, 80, 66, 0.8)', // The brand's green tint
        backgroundColor: '#0a0d12',
        linkDistance: 120, // Max distance to draw a line between particles
        mouseLinkDistance: 150, // Max distance to draw a line to the mouse
        mouseRepelDistance: 100, // Distance mouse repels particles
        mouseForce: 0.03, // Speed of repel
        particleSpeed: 0.3 // Base speed of particles
    };

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000, isActive: false };

    // Initialize Particles
    function initParticles() {
        width = canvas.parentElement.clientWidth;
        height = canvas.parentElement.clientHeight;

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Adjust particle count based on screen size to keep density consistent
        const area = width * height;
        const targetParticles = Math.floor(area / 12000);
        config.particleCount = Math.min(Math.max(50, targetParticles), 300);

        particles = [];

        for (let i = 0; i < config.particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * config.particleSpeed * 2,
                vy: (Math.random() - 0.5) * config.particleSpeed * 2,
                baseX: 0,
                baseY: 0,
                radius: Math.random() * 1 + config.particleRadius
            });
        }
    }

    // Update Particles physics
    function updateParticles() {
        if (typeof _updateParticlesLogic === 'function') {
            _updateParticlesLogic(particles, width, height, mouse, config);
        }
    }

    // Optimization: Batch particle links by opacity to reduce expensive canvas state changes and stroke calls.
    const NUM_BINS = 10;
    const bins = Array.from({ length: NUM_BINS }, () => []);
    const mouseBins = Array.from({ length: NUM_BINS }, () => []);

    // Render loop
    function render() {
        // Clear background to be transparent
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 1;

        const linkDistanceSq = config.linkDistance * config.linkDistance;
        const mouseLinkDistanceSq = config.mouseLinkDistance * config.mouseLinkDistance;
        const linkDistanceInv = 1 / config.linkDistance;
        const mouseLinkDistanceInv = 1 / config.mouseLinkDistance;

        // Clear bins without reallocating arrays (reduces garbage collection pressure)
        for (let i = 0; i < NUM_BINS; i++) {
            bins[i].length = 0;
            mouseBins[i].length = 0;
        }

        // Draw links between particles
        for (let i = 0; i < particles.length; i++) {
            let p1 = particles[i];
            let p1x = p1.x;
            let p1y = p1.y;

            // Connect to other particles
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dx = p1x - p2.x;
                let dy = p1y - p2.y;
                let distSq = dx * dx + dy * dy;

                if (distSq < linkDistanceSq) {
                    let opacity = 1 - (Math.sqrt(distSq) * linkDistanceInv);
                    let binIndex = Math.floor(opacity * NUM_BINS);
                    if (binIndex >= NUM_BINS) binIndex = NUM_BINS - 1;
                    if (binIndex < 0) binIndex = 0;
                    bins[binIndex].push(p1x, p1y, p2.x, p2.y);
                }
            }

            // Connect to mouse
            if (mouse.isActive) {
                let mdx = p1x - mouse.x;
                let mdy = p1y - mouse.y;
                let mDistSq = mdx * mdx + mdy * mdy;

                if (mDistSq < mouseLinkDistanceSq) {
                    let opacity = 1 - (Math.sqrt(mDistSq) * mouseLinkDistanceInv);
                    let binIndex = Math.floor(opacity * NUM_BINS);
                    if (binIndex >= NUM_BINS) binIndex = NUM_BINS - 1;
                    if (binIndex < 0) binIndex = 0;
                    mouseBins[binIndex].push(p1x, p1y, mouse.x, mouse.y);
                }
            }
        }

        // Render batched particle-to-particle links
        for (let i = 0; i < NUM_BINS; i++) {
            const bin = bins[i];
            if (bin.length === 0) continue;

            // Calculate representative opacity for this bin (using the upper bound of the bin)
            const opacity = (i + 1) / NUM_BINS;
            ctx.beginPath();
            for (let j = 0; j < bin.length; j += 4) {
                ctx.moveTo(bin[j], bin[j+1]);
                ctx.lineTo(bin[j+2], bin[j+3]);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
            ctx.stroke();
        }

        // Render batched mouse-to-particle links
        for (let i = 0; i < NUM_BINS; i++) {
            const bin = mouseBins[i];
            if (bin.length === 0) continue;

            const opacity = (i + 1) / NUM_BINS;
            ctx.beginPath();
            for (let j = 0; j < bin.length; j += 4) {
                ctx.moveTo(bin[j], bin[j+1]);
                ctx.lineTo(bin[j+2], bin[j+3]);
            }
            // Using accent color for mouse connections to make it pop
            ctx.strokeStyle = `rgba(56, 80, 66, ${opacity * 0.6})`;
            ctx.stroke();
        }

        // Draw particles
        ctx.fillStyle = config.particleColor;
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            ctx.moveTo(p.x + p.radius, p.y);
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    // Animation Loop
    let animationId;
    let isVisible = true;

    function animate() {
        if (!isVisible) return;
        updateParticles();
        render();
        animationId = requestAnimationFrame(animate);
    }

    // Setup Intersection Observer to pause when off-screen
    const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isVisible) {
                    isVisible = true;
                    animate(); // restart animation loop
                }
            } else {
                isVisible = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }
        });
    }, { rootMargin: '100px' });

    canvasObserver.observe(canvas.parentElement);

    // Debounce helper for resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Event Listeners
    window.addEventListener('resize', debounce(initParticles, 150));

    let canvasAbsoluteTop = 0;
    let canvasAbsoluteLeft = 0;
    let canvasHeight = 0;
    let isCanvasMetricsValid = false;

    function updateCanvasMetrics() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvasAbsoluteTop = rect.top + window.scrollY;
        canvasAbsoluteLeft = rect.left + window.scrollX;
        canvasHeight = rect.height;
        isCanvasMetricsValid = true;
    }

    // Update metrics when window resizes
    window.addEventListener('resize', debounce(updateCanvasMetrics, 150), { passive: true });

    // Defer initial measurement to allow layout to settle
    setTimeout(updateCanvasMetrics, 0);

    document.addEventListener('mousemove', (e) => {
        // Fallback for tests or before layout settles
        if (!isCanvasMetricsValid) {
            updateCanvasMetrics();
        }

        // Performance optimization: Avoid getBoundingClientRect() on every mousemove
        // by caching the absolute position and using pageX/pageY
        if (e.pageY <= canvasAbsoluteTop + canvasHeight + 100) {
            mouse.x = e.pageX - canvasAbsoluteLeft;
            mouse.y = e.pageY - canvasAbsoluteTop;
            mouse.isActive = true;
        } else {
            mouse.isActive = false;
        }
    }, { passive: true });

    // Touch support
    document.addEventListener('touchmove', (e) => {
        if (!isCanvasMetricsValid) {
            updateCanvasMetrics();
        }

        if (e.touches.length > 0) {
            if (e.touches[0].pageY <= canvasAbsoluteTop + canvasHeight + 100) {
                mouse.x = e.touches[0].pageX - canvasAbsoluteLeft;
                mouse.y = e.touches[0].pageY - canvasAbsoluteTop;
                mouse.isActive = true;
            } else {
                mouse.isActive = false;
            }
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        mouse.isActive = false;
    });

    // Start
    initParticles();
    animate();
});
