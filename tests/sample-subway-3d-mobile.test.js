/**
 * @jest-environment jsdom
 */

describe('Sample Subway 3D Mobile Touch Interaction', () => {
    let container, toggleBtn, btnText;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="3d-container" style="pointer-events: auto;"></div>
            <div class="3d-controls-overlay">
                <button id="toggle-3d-controls" class="toggle-3d-btn">
                    <span class="btn-text">Tap to Interact with 3D Model</span>
                </button>
            </div>
        `;

        container = document.getElementById('3d-container');
        toggleBtn = document.getElementById('toggle-3d-controls');
        btnText = toggleBtn.querySelector('.btn-text');
    });

    it('sets pointer-events to none on mobile (< 768px) by default', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

        const updateMobileTouchState = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                if (!container.classList.contains('interactive')) {
                    container.style.pointerEvents = 'none';
                }
            } else {
                container.style.pointerEvents = 'auto';
            }
        };

        updateMobileTouchState();
        expect(container.style.pointerEvents).toBe('none');
    });

    it('toggles pointer-events and button label on click', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isNowInteractive = container.classList.toggle('interactive');
            if (isNowInteractive) {
                container.style.pointerEvents = 'auto';
                toggleBtn.classList.add('active');
                btnText.textContent = 'Exit 3D View (Scroll Mode)';
            } else {
                container.style.pointerEvents = 'none';
                toggleBtn.classList.remove('active');
                btnText.textContent = 'Tap to Interact with 3D Model';
            }
        });

        // First tap: enable 3D interaction
        toggleBtn.click();
        expect(container.classList.contains('interactive')).toBe(true);
        expect(container.style.pointerEvents).toBe('auto');
        expect(toggleBtn.classList.contains('active')).toBe(true);
        expect(btnText.textContent).toBe('Exit 3D View (Scroll Mode)');

        // Second tap: exit 3D view and restore scrolling
        toggleBtn.click();
        expect(container.classList.contains('interactive')).toBe(false);
        expect(container.style.pointerEvents).toBe('none');
        expect(toggleBtn.classList.contains('active')).toBe(false);
        expect(btnText.textContent).toBe('Tap to Interact with 3D Model');
    });

    it('keeps pointer-events auto on desktop screens (>= 768px)', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });

        const updateMobileTouchState = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                if (!container.classList.contains('interactive')) {
                    container.style.pointerEvents = 'none';
                }
            } else {
                container.style.pointerEvents = 'auto';
            }
        };

        updateMobileTouchState();
        expect(container.style.pointerEvents).toBe('auto');
    });
});
