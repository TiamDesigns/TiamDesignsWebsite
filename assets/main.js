// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
    }
  });
}

// Smooth scroll for in-page links is handled natively via CSS `scroll-behavior: smooth` and `scroll-padding-top`

// Header scroll effect
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Project filter
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    projectCards.forEach((card) => {
      const categories = card.getAttribute('data-category').split(' ');
      if (filter === 'all' || categories.includes(filter)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Skill toggle on cards
document.querySelectorAll('.skill-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    if (!card) return;
    const expanded = card.dataset.expanded === 'true';
    card.dataset.expanded = expanded ? 'false' : 'true';
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    button.textContent = expanded ? 'Show all skills' : 'Hide skills';
  });
});

// Dynamic year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Prevent browser/extension editing overlays (Grammarly etc.)
(() => {
  try {
    // Disable spellcheck globally
    document.documentElement.setAttribute('spellcheck', 'false');

    // Mark fields and content to opt-out where possible
    document.querySelectorAll('input, textarea, [contenteditable]').forEach((el) => {
      el.setAttribute('spellcheck', 'false');
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('autocorrect', 'off');
      el.setAttribute('data-gramm', 'false');
      el.setAttribute('data-gramm_editor', 'false');
    });

    // Add data-gramm attributes to body as extra hint
    document.body.setAttribute('data-gramm', 'false');
    document.body.setAttribute('data-gramm_editor', 'false');
  } catch (e) {
    // Fail silently — extensions may ignore these attributes
    console.warn('Could not set editing opt-out attributes', e);
  }
})();
// Animations
document.addEventListener('DOMContentLoaded', () => {
  // Hero Animation Setup
  const heroElements = document.querySelectorAll('.hero h1, .hero-subtitle, .hero-actions .btn');
  heroElements.forEach(el => el.classList.add('has-animation'));

  // Project Cards Setup
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(el => el.classList.add('has-animation'));

  // Section Headers Setup
  const sectionHeaders = document.querySelectorAll('.section h2');
  sectionHeaders.forEach(el => el.classList.add('has-animation'));

  // Check if anime is loaded
  if (typeof anime === 'undefined') {
    console.warn('Anime.js not loaded. Skipping animations.');
    document.querySelectorAll('.has-animation').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.remove('has-animation');
    });
    return;
  }

  // Initial Hero Animation
  anime({
    targets: '.hero .has-animation',
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(100, { start: 300 }),
    easing: 'easeOutQuad',
    duration: 800,
    complete: function (anim) {
      heroElements.forEach(el => el.classList.remove('has-animation'));

      // Trigger SVG Toolbox Animation AFTER text finishes
      if (document.querySelector('.hero-toolbox-svg')) {
        const tl = anime.timeline({
          easing: 'easeOutExpo',
        });

        // 1. Fade in and slide up the ENTIRE toolbox
        tl.add({
          targets: '#toolbox-entire',
          opacity: [0, 1],
          translateY: [40, 0], // Larger initial slide
          duration: 1500, // Slowed down from 800
          easing: 'easeOutQuart'
        })
          // 2. Open the lid naturally (hinge from the bottom-back edge)
          .add({
            targets: '#toolbox-lid',
            rotate: -130, // Hinge backwards
            transformOrigin: '50% 100%', // Bottom center of the lid element
            duration: 1800, // Slowed down from 1000
            easing: 'easeOutElastic(1, .8)' // Smoother elasticity
          }, '-=600')
          // 3. Pop out the icons from INSIDE the box
          .add({
            targets: '#toolbox-contents',
            opacity: 1,
            duration: 200
          }, '-=1000')
          .add({
            targets: '.floating-icon',
            translateY: function (el, i) {
              return [0, [-90, -150, -80][i]]; // Rise higher out of the box
            },
            translateX: function (el, i) {
              return [0, [-100, 0, 100][i]]; // Spread out horizontally wider
            },
            scale: [0, 1],
            opacity: [0, 1],
            delay: anime.stagger(250), // Stagger slower
            duration: 1800, // Float up slower
            easing: 'easeOutElastic(1, .7)',
            complete: function () {
              // Add continuous floating animation
              anime({
                targets: '.floating-icon',
                translateY: function (el) {
                  // Get current absolute Y translation
                  const currentY = parseFloat(el.style.transform.split('translateY(')[1]);
                  return [currentY, currentY - 20];
                },
                direction: 'alternate',
                loop: true,
                duration: function () { return anime.random(3000, 4500); }, // Slower infinite loop
                easing: 'easeInOutSine',
                delay: function () { return anime.random(0, 1000); }
              });
            }
          }, '-=1000');
      }
    }
  });

  // --- NEW: Navigation Stagger ---
  const navItems = document.querySelectorAll('.nav-links li');
  // Set initial state to invisible to avoid flash
  anime.set(navItems, { opacity: 0, translateY: -10 });

  anime({
    targets: navItems,
    opacity: [0, 1],
    translateY: [-10, 0],
    delay: anime.stagger(80, { start: 800 }), // Start after hero begins
    easing: 'easeOutExpo',
    duration: 800
  });

  // --- NEW: Elastic Button Hovers ---
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      anime.remove(btn);
      anime({
        targets: btn,
        scale: 1.05,
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      });
    });
    btn.addEventListener('mouseleave', () => {
      anime.remove(btn);
      anime({
        targets: btn,
        scale: 1,
        duration: 600,
        easing: 'easeOutElastic(1, .6)'
      });
    });
  });



  // --- NEW: Expanded Project Page Animations ---

  // 1. Identification: Add `.has-animation` to key elements
  const scrollTargets = [
    '.feature-item',          // Icon grids
    '.gallery-grid img',      // Gallery images
    '.process-step',          // Design process steps
    '.project-intro-text',    // Intro text
    '.two-col-grid > div',    // Split content columns
    '.research-gallery h3',   // Research headers
    '.analysis-table-img',    // Analysis images
    '.carousel-container'     // Carousels
  ];

  scrollTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('has-animation');
      // Set initial opacity via JS to avoid CSS issues if JS fails,
      // though CSS class is better. For now, Anime helper:
      el.style.opacity = '0';
    });
  });

  // Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const animateOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate the element
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [30, 0], // Slightly larger movement for content
          easing: 'easeOutCubic',
          duration: 1000,
          delay: entry.target.dataset.delay || 0
        });

        // Stop observing once animated
        observer.unobserve(entry.target);
        entry.target.classList.remove('has-animation');
      }
    });
  }, observerOptions);

  // Observe Project Cards (Existing)
  projectCards.forEach((el, index) => {
    el.dataset.delay = index % 3 * 100;
    animateOnScroll.observe(el);
  });

  // Observe Section Headers (Existing)
  sectionHeaders.forEach(el => {
    animateOnScroll.observe(el);
  });

  // Observe NEW Targets with Stagger Logic
  document.querySelectorAll('.gallery-grid img').forEach((el, index) => {
    el.dataset.delay = (index % 3) * 150; // Stagger gallery images
    animateOnScroll.observe(el);
  });

  document.querySelectorAll('.feature-item').forEach((el, index) => {
    el.dataset.delay = (index % 4) * 100; // Stagger feature icons
    animateOnScroll.observe(el);
  });

  document.querySelectorAll('.process-step').forEach((el, index) => {
    el.dataset.delay = index * 200; // Sequential process steps
    animateOnScroll.observe(el);
  });

  // Observe remaining generic targets without specific stagger logic
  document.querySelectorAll('.project-intro-text, .two-col-grid > div, .research-gallery h3, .analysis-table-img, .carousel-container').forEach(el => {
    animateOnScroll.observe(el);
  });
});


// --- NEW: Elastic Overscroll (Stretchy Bounce) ---
document.addEventListener('DOMContentLoaded', () => {
  let currentY = 0;
  let startY = 0;
  let isDragging = false;
  const body = document.body;

  // Physics constants - softer and less aggressive pull
  const MAX_PULL = 40;
  const FRICTION = 0.15;
  const SNAP_DURATION = 400;

  // Helper to clamp values
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Helper to stop current animation
  const stopAnimation = () => {
    if (typeof anime !== 'undefined') anime.remove(body);
  };

  // Touch Events
  document.addEventListener('touchstart', (e) => {
    // Tighter bottom tolerance (-1px) ensures native scroll reaches the absolute bottom before intercepting
    if (window.scrollY <= 0 || Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1) {
      startY = e.touches[0].clientY - (currentY / FRICTION); // Account for existing pull
      isDragging = true;
      stopAnimation();
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY;

    if (window.scrollY <= 0 && deltaY > 0) {
      currentY = Math.min(deltaY * FRICTION, MAX_PULL);
      if (e.cancelable) e.preventDefault();
      body.style.transform = `translateY(${currentY}px)`;
    }
    else if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1 && deltaY < 0) {
      currentY = Math.max(deltaY * FRICTION, -MAX_PULL);
      if (e.cancelable) e.preventDefault();
      body.style.transform = `translateY(${currentY}px)`;
    }
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;

    if (currentY > 60) {
      window.location.reload();
      return;
    }

    if (currentY !== 0) {
      if (typeof anime !== 'undefined') {
        anime({
          targets: body,
          translateY: 0,
          easing: 'easeOutCubic', // Softer curve, less aggressive snap
          duration: SNAP_DURATION,
          complete: () => {
            currentY = 0;
            body.style.transform = '';
          }
        });
      } else {
        body.style.transform = '';
        currentY = 0;
      }
    }
  });

  let wheelTimeout;
  document.addEventListener('wheel', (e) => {
    const isAtTop = window.scrollY <= 0;
    const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1;

    // Instant cancel if user scrolls opposite to overscroll
    if (currentY !== 0 && ((currentY > 0 && e.deltaY > 0) || (currentY < 0 && e.deltaY < 0))) {
      stopAnimation();
      currentY = 0;
      body.style.transform = '';
      return; // Handled by native scroll
    }

    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      if (e.cancelable) e.preventDefault(); // Prevent native browser overscroll glow/bounce
      stopAnimation();

      currentY -= e.deltaY * FRICTION;
      currentY = clamp(currentY, -MAX_PULL, MAX_PULL);
      body.style.transform = `translateY(${currentY}px)`;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (typeof anime !== 'undefined') {
          anime({
            targets: body,
            translateY: 0,
            easing: 'easeOutCubic',
            duration: SNAP_DURATION,
            complete: () => {
              currentY = 0;
              body.style.transform = '';
            }
          });
        } else {
          body.style.transform = '';
          currentY = 0;
        }
      }, 50); // fast timeout makes it snap back immediately when scrolling stops
    }
  }, { passive: false });
});

// --- Lightbox Gallery Implementation ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Create Lightbox HTML Structure
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox-overlay';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img id="lightbox-img" src="" alt="Zoomed Image">
      <div class="lightbox-controls">
        <button id="lightbox-zoom-out" aria-label="Zoom Out">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <button id="lightbox-zoom-in" aria-label="Zoom In">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <button id="lightbox-close" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div id="lightbox-caption" class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const zoomInBtn = document.getElementById('lightbox-zoom-in');
  const zoomOutBtn = document.getElementById('lightbox-zoom-out');
  const captionText = document.getElementById('lightbox-caption');

  let currentZoom = 1;
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;

  // 2. Select Images
  // Targeting images inside specific containers to specific galleries or feature images
  const images = document.querySelectorAll('.gallery-grid figure img, .two-col-grid figure img, .feature-image, .analysis-table-img');

  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox(img);
    });
  });

  // 3. Open Lightbox
  function openLightbox(img) {
    if (typeof anime !== 'undefined') {
      anime({
        targets: lightbox,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad',
        begin: () => {
          lightbox.style.display = 'flex';
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;

          // Try to find caption
          const figcaption = img.closest('figure')?.querySelector('figcaption');
          if (figcaption) {
            captionText.textContent = figcaption.textContent;
          } else {
            captionText.textContent = img.alt;
          }

          currentZoom = 1;
          translateX = 0;
          translateY = 0;
          updateTransform();
        }
      });
    } else {
      lightbox.style.display = 'flex';
      lightbox.style.opacity = '1';
      lightboxImg.src = img.src;
      // Caption logic same as above
      const figcaption = img.closest('figure')?.querySelector('figcaption');
      if (figcaption) {
        captionText.textContent = figcaption.textContent;
      } else {
        captionText.textContent = img.alt;
      }
    }
  }

  // 4. Close Lightbox
  function closeLightbox() {
    if (typeof anime !== 'undefined') {
      anime({
        targets: lightbox,
        opacity: 0,
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          lightbox.style.display = 'none';
          lightboxImg.src = '';
        }
      });
    } else {
      lightbox.style.display = 'none';
    }
  }

  // Event Listeners for controls
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
      closeLightbox();
    }
  });

  // 5. Zoom Logic
  zoomInBtn.addEventListener('click', () => {
    currentZoom += 0.5;
    updateTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    if (currentZoom > 0.5) {
      currentZoom -= 0.5;
      updateTransform();
    }
  });

  function updateTransform() {
    lightboxImg.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    lightboxImg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
  }

  // Pan Logic (Optional simple drag when zoomed)
  lightboxImg.addEventListener('mousedown', (e) => {
    if (currentZoom <= 1) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxImg.style.cursor = 'grabbing';
    e.preventDefault(); // Prevent standard drag
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    lightboxImg.style.transform = `scale(${currentZoom}) translate(${translateX / currentZoom}px, ${translateY / currentZoom}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      lightboxImg.style.cursor = 'grab';
    }
  });
});

// --- Masonry Grid Logic ---
function resizeGridItem(item) {
  const grid = item.closest('.gallery-grid');
  if (!grid) return;

  // Get the row height and gap from the grid
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')) || parseInt(window.getComputedStyle(grid).getPropertyValue('gap')) || 0;

  // The content inside the figure (the img + figcaption)
  const content = item.querySelector('img');
  const caption = item.querySelector('figcaption');

  // Wait for image to load to get true height if necessary, though ideally they are loaded
  if (!content) return;

  let totalHeight = content.getBoundingClientRect().height;
  if (caption) {
    totalHeight += caption.getBoundingClientRect().height;
  }

  // Calculate how many rows this item needs to span
  const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAllGridItems() {
  const allItems = document.querySelectorAll(".gallery-grid figure");
  allItems.forEach(item => {
    resizeGridItem(item);
  });
}

// Recalculate on window resize
window.addEventListener("resize", resizeAllGridItems);

// Initial calculation and lazy-load handling
document.addEventListener('DOMContentLoaded', () => {
  // Initial call
  resizeAllGridItems();

  // Add load event listener to each image to recalculate when lazy-loaded
  const allImages = document.querySelectorAll(".gallery-grid figure img");
  allImages.forEach(img => {
    if (img.complete) {
      resizeGridItem(img.closest('figure'));
    } else {
      img.addEventListener('load', () => {
        resizeGridItem(img.closest('figure'));
      });
    }
  });
});

