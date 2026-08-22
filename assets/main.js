// Mobile nav toggle & smooth scroll lock
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

let isManualScrolling = false;
let manualScrollTimer = null;

if (navToggle && navLinks) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navLinks.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close when clicking outside the navigation menu
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open', 'active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  navLinks.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      navLinks.classList.remove('open', 'active');
      navToggle.setAttribute('aria-expanded', 'false');
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        
        // Immediately set active link
        document.querySelectorAll('.nav-links a').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === href);
        });

        // Set manual scrolling lock
        isManualScrolling = true;
        if (manualScrollTimer) clearTimeout(manualScrollTimer);

        const unlock = () => {
          isManualScrolling = false;
          window.removeEventListener('scrollend', unlock);
        };

        if ('onscrollend' in window) {
          window.addEventListener('scrollend', unlock, { once: true });
        }
        manualScrollTimer = setTimeout(unlock, 800);
      }
    }
  });
}

// Header scroll effect & active section indicator
const header = document.querySelector('.site-header');
const navLinkElements = document.querySelectorAll('.nav-links a');

const handleScrollEffect = () => {
  if (window.scrollY > 50) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }

  if (isManualScrolling) return;

  // Top of page / Hero section check (< 150px)
  if (window.scrollY < 150) {
    navLinkElements.forEach((link) => link.classList.remove('active'));
    return;
  }

  // Contact Section Fallback Calculation
  const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
  if (isAtBottom && navLinkElements.length > 0) {
    navLinkElements.forEach((link) => {
      if (link.getAttribute('href') === '#contact') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

window.addEventListener('scroll', handleScrollEffect, { passive: true });
handleScrollEffect();

// Active section observer
if ('IntersectionObserver' in window && navLinkElements.length > 0) {
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: [0.1, 0.25, 0.5, 0.75]
  };

  const visibleSectionsMap = {};

  const observer = new IntersectionObserver((entries) => {
    if (isManualScrolling) return;

    if (window.scrollY < 150) {
      navLinkElements.forEach((link) => link.classList.remove('active'));
      return;
    }

    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
    if (isAtBottom) return;

    entries.forEach((entry) => {
      visibleSectionsMap[entry.target.id] = entry;
    });

    const activeEntries = Object.values(visibleSectionsMap).filter(entry => entry.isIntersecting);

    if (activeEntries.length > 0) {
      const mostVisible = activeEntries.reduce((prev, current) =>
        current.intersectionRatio > prev.intersectionRatio ? current : prev
      );

      if (mostVisible && mostVisible.target) {
        const id = mostVisible.target.getAttribute('id');
        navLinkElements.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }
  }, observerOptions);

  document.querySelectorAll('section[id]').forEach((sec) => {
    observer.observe(sec);
  });
}


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
function initAnimations() {
  const heroElements = document.querySelectorAll('.hero h1, .hero h2, .hero-kicker, .hero-sans, .hero-display, .hero-subtitle, .hero-actions .btn');
  const projectCards = document.querySelectorAll('.project-card');
  const sectionHeaders = document.querySelectorAll('.section h2');

  // Check if anime is loaded
  if (typeof anime === 'undefined') {
    console.warn('Anime.js not loaded. Skipping animations.');
    return;
  }

  // Initial Hero Animation
  anime({
    targets: heroElements,
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(80, { start: 150 }),
    easing: 'easeOutQuad',
    duration: 700
  });

  // SVG Toolbox Animation
  if (document.querySelector('.hero-toolbox-svg')) {
    const tl = anime.timeline({
      easing: 'easeOutExpo',
    });

        // 1. Fade in and slide up the ENTIRE toolbox
        tl.add({
          targets: '#toolbox-entire',
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 1200,
          easing: 'easeOutQuart'
        })
          // 2. Lift lid straight up, move to the right, and place down beside the toolbox
          .add({
            targets: '#toolbox-lid',
            keyframes: [
              { translateY: -65, translateX: 0, rotate: 0, duration: 450, easing: 'easeOutQuad' },
              { translateY: -45, translateX: 220, rotate: 12, duration: 550, easing: 'easeInOutQuad' },
              { translateY: 62, translateX: 215, rotate: 0, duration: 500, easing: 'easeOutBounce' }
            ]
          }, '-=600')
          // 3. Pop out the tools-of-trade icons from INSIDE the box
          .add({
            targets: '#toolbox-contents',
            opacity: 1,
            duration: 200
          }, '-=1000')
          .add({
            targets: '.floating-icon',
            translateY: function (el, i) {
              return [0, [-80, -120, -80][i]];
            },
            translateX: function (el, i) {
              return [0, [-100, 0, 100][i]]; // Spread out horizontally wider
            },
            scale: [0, 1],
            opacity: [0, 1],
            delay: anime.stagger(220),
            duration: 1600,
            easing: 'easeOutElastic(1, .75)',
            complete: function () {
              // Add continuous floating animation
              anime({
                targets: '.floating-icon',
                translateY: function (el) {
                  const currentY = anime.get(el, 'translateY');
                  return [currentY, currentY - 18];
                },
                direction: 'alternate',
                loop: true,
                duration: function () { return anime.random(3000, 4200); },
                easing: 'easeInOutSine',
                delay: function () { return anime.random(0, 800); }
              });
            }
          }, '-=1000');
      }

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
}

// --- NEW: Expanded Project Page Animations ---
function initScrollAnimations() {
  if (typeof anime === 'undefined') return;

  const projectCards = document.querySelectorAll('.project-card');
  const sectionHeaders = document.querySelectorAll('.section h2');

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
}


// --- Elastic Overscroll (Disabled to preserve native scrolling performance) ---
function initElasticOverscroll() {
  // Native CSS `overscroll-behavior-y: contain` handles overscroll bounds safely without JS locking.
}

// --- Lightbox Gallery Implementation ---
function initLightbox() {
  // 1. Create Lightbox HTML Structure
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox-overlay';
  const content = document.createElement('div');
  content.className = 'lightbox-content';

  const img = document.createElement('img');
  img.id = 'lightbox-img';
  img.src = '';
  img.alt = 'Zoomed Image';

  const controls = document.createElement('div');
  controls.className = 'lightbox-controls';

  const svgNS = 'http://www.w3.org/2000/svg';

  const zoomOutBtnElement = document.createElement('button');
  zoomOutBtnElement.id = 'lightbox-zoom-out';
  zoomOutBtnElement.setAttribute('aria-label', 'Zoom Out');
  const svgZoomOut = document.createElementNS(svgNS, 'svg');
  svgZoomOut.setAttribute('width', '24');
  svgZoomOut.setAttribute('height', '24');
  svgZoomOut.setAttribute('viewBox', '0 0 24 24');
  svgZoomOut.setAttribute('fill', 'none');
  svgZoomOut.setAttribute('stroke', 'currentColor');
  svgZoomOut.setAttribute('stroke-width', '2');
  const circleOut = document.createElementNS(svgNS, 'circle');
  circleOut.setAttribute('cx', '11');
  circleOut.setAttribute('cy', '11');
  circleOut.setAttribute('r', '8');
  const lineOut1 = document.createElementNS(svgNS, 'line');
  lineOut1.setAttribute('x1', '21');
  lineOut1.setAttribute('y1', '21');
  lineOut1.setAttribute('x2', '16.65');
  lineOut1.setAttribute('y2', '16.65');
  const lineOut2 = document.createElementNS(svgNS, 'line');
  lineOut2.setAttribute('x1', '8');
  lineOut2.setAttribute('y1', '11');
  lineOut2.setAttribute('x2', '14');
  lineOut2.setAttribute('y2', '11');
  svgZoomOut.append(circleOut, lineOut1, lineOut2);
  zoomOutBtnElement.appendChild(svgZoomOut);

  const zoomInBtnElement = document.createElement('button');
  zoomInBtnElement.id = 'lightbox-zoom-in';
  zoomInBtnElement.setAttribute('aria-label', 'Zoom In');
  const svgZoomIn = document.createElementNS(svgNS, 'svg');
  svgZoomIn.setAttribute('width', '24');
  svgZoomIn.setAttribute('height', '24');
  svgZoomIn.setAttribute('viewBox', '0 0 24 24');
  svgZoomIn.setAttribute('fill', 'none');
  svgZoomIn.setAttribute('stroke', 'currentColor');
  svgZoomIn.setAttribute('stroke-width', '2');
  const circleIn = document.createElementNS(svgNS, 'circle');
  circleIn.setAttribute('cx', '11');
  circleIn.setAttribute('cy', '11');
  circleIn.setAttribute('r', '8');
  const lineIn1 = document.createElementNS(svgNS, 'line');
  lineIn1.setAttribute('x1', '21');
  lineIn1.setAttribute('y1', '21');
  lineIn1.setAttribute('x2', '16.65');
  lineIn1.setAttribute('y2', '16.65');
  const lineIn2 = document.createElementNS(svgNS, 'line');
  lineIn2.setAttribute('x1', '11');
  lineIn2.setAttribute('y1', '8');
  lineIn2.setAttribute('x2', '11');
  lineIn2.setAttribute('y2', '14');
  const lineIn3 = document.createElementNS(svgNS, 'line');
  lineIn3.setAttribute('x1', '8');
  lineIn3.setAttribute('y1', '11');
  lineIn3.setAttribute('x2', '14');
  lineIn3.setAttribute('y2', '11');
  svgZoomIn.append(circleIn, lineIn1, lineIn2, lineIn3);
  zoomInBtnElement.appendChild(svgZoomIn);

  const closeBtnElement = document.createElement('button');
  closeBtnElement.id = 'lightbox-close';
  closeBtnElement.setAttribute('aria-label', 'Close');
  const svgClose = document.createElementNS(svgNS, 'svg');
  svgClose.setAttribute('width', '24');
  svgClose.setAttribute('height', '24');
  svgClose.setAttribute('viewBox', '0 0 24 24');
  svgClose.setAttribute('fill', 'none');
  svgClose.setAttribute('stroke', 'currentColor');
  svgClose.setAttribute('stroke-width', '2');
  const lineClose1 = document.createElementNS(svgNS, 'line');
  lineClose1.setAttribute('x1', '18');
  lineClose1.setAttribute('y1', '6');
  lineClose1.setAttribute('x2', '6');
  lineClose1.setAttribute('y2', '18');
  const lineClose2 = document.createElementNS(svgNS, 'line');
  lineClose2.setAttribute('x1', '6');
  lineClose2.setAttribute('y1', '6');
  lineClose2.setAttribute('x2', '18');
  lineClose2.setAttribute('y2', '18');
  svgClose.append(lineClose1, lineClose2);
  closeBtnElement.appendChild(svgClose);

  controls.append(zoomOutBtnElement, zoomInBtnElement, closeBtnElement);

  const caption = document.createElement('div');
  caption.id = 'lightbox-caption';
  caption.className = 'lightbox-caption';

  content.append(img, controls, caption);
  lightbox.appendChild(content);
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
      lightboxImg.alt = img.alt;
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
}

// --- Masonry Grid Logic ---
let masonryRafId = null;

function performMasonryLayout() {
  const allItems = document.querySelectorAll(".gallery-grid figure");
  const updates = [];
  const gridStyleCache = new Map();

  // READ PHASE
  allItems.forEach(item => {
    const grid = item.closest('.gallery-grid');
    if (!grid) return;

    let gridStyle = gridStyleCache.get(grid);
    if (!gridStyle) {
      const computedStyle = window.getComputedStyle(grid);
      gridStyle = {
        rowHeight: parseInt(computedStyle.getPropertyValue('grid-auto-rows')) || 0,
        rowGap: parseInt(computedStyle.getPropertyValue('grid-row-gap')) || parseInt(computedStyle.getPropertyValue('gap')) || 0
      };
      gridStyleCache.set(grid, gridStyle);
    }

    const { rowHeight, rowGap } = gridStyle;

    const content = item.querySelector('img');
    const caption = item.querySelector('figcaption');

    if (!content || rowHeight === 0) return;

    let totalHeight = content.offsetHeight;
    if (caption) {
      totalHeight += caption.offsetHeight;
    }

    const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
    updates.push({ item, rowSpan });
  });

  // WRITE PHASE
  updates.forEach(({ item, rowSpan }) => {
    item.style.gridRowEnd = "span " + rowSpan;
  });
}

function resizeAllGridItems() {
  if (masonryRafId) {
    cancelAnimationFrame(masonryRafId);
  }
  masonryRafId = requestAnimationFrame(performMasonryLayout);
}

function resizeGridItem(item) {
  // To avoid thrashing, even single item resizes will trigger a full batched resize
  resizeAllGridItems();
}

// Recalculate on window resize
window.addEventListener("resize", resizeAllGridItems);

// Initial calculation and lazy-load handling
function initMasonryGrid() {
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
}

// --- Initialize All Features ---
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initScrollAnimations();
  initElasticOverscroll();
  initLightbox();
  initMasonryGrid();
});

