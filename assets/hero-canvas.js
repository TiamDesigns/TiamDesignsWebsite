// Hero Canvas: Interactive Node Particle Network
// A subtle dark particle network that connects dots and reacts to the cursor

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
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

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
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.mouseRepelDistance && dist > 0) {
                    let forceDirectionX = dx / dist;
                    let forceDirectionY = dy / dist;
                    let force = (config.mouseRepelDistance - dist) / config.mouseRepelDistance;

                    p.vx += forceDirectionX * force * config.mouseForce;
                    p.vy += forceDirectionY * force * config.mouseForce;
                }
            }

            // Apply friction/damping to return to base speed
            let currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (currentSpeed > config.particleSpeed) {
                p.vx *= 0.98;
                p.vy *= 0.98;
            } else if (currentSpeed < config.particleSpeed * 0.5) {
                // Gentle nudge if too slow
                p.vx *= 1.02;
                p.vy *= 1.02;
            }
        }
    }

    // Render loop
    function render() {
        // Clear background to be transparent
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 1;

        // Draw links between particles
        for (let i = 0; i < particles.length; i++) {
            let p1 = particles[i];

            // Connect to other particles
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let distSq = dx * dx + dy * dy;

                if (distSq < config.linkDistance * config.linkDistance) {
                    let dist = Math.sqrt(distSq);
                    let opacity = 1 - (dist / config.linkDistance);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    ctx.stroke();
                }
            }

            // Connect to mouse
            if (mouse.isActive) {
                let mdx = p1.x - mouse.x;
                let mdy = p1.y - mouse.y;
                let mDistSq = mdx * mdx + mdy * mdy;

                if (mDistSq < config.mouseLinkDistance * config.mouseLinkDistance) {
                    let mDist = Math.sqrt(mDistSq);
                    let opacity = 1 - (mDist / config.mouseLinkDistance);

                    // Use a slightly different color or brightness for mouse connections
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    // Using accent color for mouse connections to make it pop
                    ctx.strokeStyle = `rgba(56, 80, 66, ${opacity * 0.6})`;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.fill();
        }
    }

    // Animation Loop
    function animate() {
        updateParticles();
        render();
        requestAnimationFrame(animate);
    }

    // Event Listeners
    window.addEventListener('resize', initParticles);

    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Check if mouse is over/near the canvas section (hero section)
        if (e.clientY <= rect.bottom + 100) {
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.isActive = true;
        } else {
            mouse.isActive = false;
        }
    });

    // Touch support
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            if (e.touches[0].clientY <= rect.bottom + 100) {
                mouse.x = e.touches[0].clientX - rect.left;
                mouse.y = e.touches[0].clientY - rect.top;
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
