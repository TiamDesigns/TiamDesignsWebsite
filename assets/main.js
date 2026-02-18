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

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
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

  // --- NEW: Project Card Lift ---
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Only animate if not currently part of the initial scroll reveal
      if (!card.classList.contains('has-animation')) {
        anime.remove(card);
        anime({
          targets: card,
          translateY: -8,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          borderColor: 'rgba(201, 78, 68, 0.8)', // Sync with CSS hover
          duration: 400,
          easing: 'easeOutQuad'
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('has-animation')) {
        anime.remove(card);
        anime({
          targets: card,
          translateY: 0,
          boxShadow: '0 14px 30px rgba(3, 4, 5, 0.9)', // Reset to CSS default
          borderColor: 'rgba(255, 255, 255, 0.06)', // Reset to CSS default
          duration: 400,
          easing: 'easeOutQuad'
        });
      }
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

  // Physics constants
  const MAX_PULL = 80;  // Max pixels to translate
  const FRICTION = 0.3; // Resistance factor
  const SNAP_DURATION = 600; // ms for return animation

  // Helper to clamp values
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Touch Events
  document.addEventListener('touchstart', (e) => {
    // Only trigger if at top or bottom
    if (window.scrollY === 0 || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY;

    // At Top: Pulling Down (deltaY > 0)
    if (window.scrollY === 0 && deltaY > 0) {
      currentY = deltaY * FRICTION;
      currentY = clamp(currentY, 0, MAX_PULL);
      body.style.transform = `translateY(${currentY}px)`;
    }
    // At Bottom: Pulling Up (deltaY < 0)
    else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5 && deltaY < 0) {
      currentY = deltaY * FRICTION;
      currentY = clamp(currentY, -MAX_PULL, 0); // Negative for pulling up
      body.style.transform = `translateY(${currentY}px)`;
    }
  }, { passive: false });

  // Snap back on release
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;

    if (currentY !== 0) {
      anime({
        targets: body,
        translateY: 0,
        easing: 'easeOutElastic(1, .8)', // Slightly less bouncy, more snappy
        duration: SNAP_DURATION,
        complete: () => {
          currentY = 0;
          body.style.transform = '';
        }
      });
    }
  });

  // Wheel Events (Mouse/Trackpad) - Debounced elasticity
  let wheelTimeout;

  document.addEventListener('wheel', (e) => {
    const isAtTop = window.scrollY === 0;
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2;

    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      // Accumulate scroll
      currentY -= e.deltaY * 0.5;

      // Cap max pull for mouse
      if (currentY > MAX_PULL) currentY = MAX_PULL;
      if (currentY < -MAX_PULL) currentY = -MAX_PULL;

      body.style.transform = `translateY(${currentY}px)`;

      // Reset after pause
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        anime({
          targets: body,
          translateY: 0,
          easing: 'easeOutElastic(1, .8)',
          duration: SNAP_DURATION,
          complete: () => {
            currentY = 0;
            body.style.transform = '';
          }
        });
      }, 150);
    }
  }, { passive: false });
});
