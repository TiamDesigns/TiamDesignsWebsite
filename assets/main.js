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
        delay: anime.stagger(100, {start: 300}),
        easing: 'easeOutQuad',
        duration: 800,
        complete: function(anim) {
             heroElements.forEach(el => el.classList.remove('has-animation'));
        }
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
                    translateY: [20, 0],
                    easing: 'easeOutQuad',
                    duration: 800,
                    delay: entry.target.dataset.delay || 0 // Optional delay attribute
                });
                
                // Stop observing once animated
                observer.unobserve(entry.target);
                entry.target.classList.remove('has-animation');
            }
        });
    }, observerOptions);

    // Observe elements
    projectCards.forEach((el, index) => {
        // Add a slight stagger delay for cards in the same grid
        el.dataset.delay = index % 3 * 100; 
        animateOnScroll.observe(el);
    });

    sectionHeaders.forEach(el => {
        animateOnScroll.observe(el);
    });
});
