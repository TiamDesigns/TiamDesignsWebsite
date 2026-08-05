import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Single global source of truth for navigation links across all pages and sub-pages
 */
export const NAV_LINKS = [
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'projects', label: 'Projects', href: '/#projects' },
  { id: 'experience', label: 'Experience', href: '/#experience' },
  { id: 'skills', label: 'Skills', href: '/#skills' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // Default to null for Hero area
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProjectPage, setIsProjectPage] = useState(false);
  
  // Manual Scroll Lock Flag & Timer Ref
  const isManualScrolling = useRef(false);
  const manualScrollTimer = useRef(null);
  
  // Map ref to store observed section entries for single winner calculation
  const visibleSections = useRef({});

  // Indicator pill positioning state
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Ref map for nav link elements to measure dimensions dynamically
  const navItemRefs = useRef({});
  const navContainerRef = useRef(null);

  // Route Detection (Main Portfolio Page vs Project Detail Page)
  useEffect(() => {
    const checkRoute = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        
        // Detect explicit project detail sub-page routes
        const isProjectRoute =
          path.includes('/projects/') ||
          path.includes('titan65') ||
          path.includes('sample-subway') ||
          path.includes('thesis-project') ||
          path.includes('augmented-dance-education');

        // Detect main portfolio home root
        const isHomeRoot =
          path === '/' ||
          path === '' ||
          path.endsWith('/index.html') ||
          path.endsWith('/tiamdesignswebsite/') ||
          path.endsWith('/tiamdesignswebsite/index.html');

        const projectMode = isProjectRoute || (!isHomeRoot && path.length > 1);
        setIsProjectPage(projectMode);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Update active indicator position over the active nav link (or fade out if activeSection is null)
  const updateIndicatorPosition = useCallback(() => {
    if (!activeSection || isProjectPage) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const activeEl = navItemRefs.current[activeSection];
    const containerEl = navContainerRef.current;

    if (activeEl && containerEl) {
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection, isProjectPage]);

  // Handle window scroll state, top-of-page Hero check (< 50px), and bottom fallback
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Update background prominence state (scrollY >= 50px)
      setIsScrolled(scrollY >= 50);

      // Guard: Do not override active section while smooth manual scrolling is active or on project pages
      if (isManualScrolling.current || isProjectPage) return;

      // 1. Top of page / Hero section check (< 50px)
      if (scrollY < 50) {
        setActiveSection(null);
        return;
      }

      // 2. Contact Section Fallback Calculation for short footers/bottom of page
      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        setActiveSection('contact');
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateIndicatorPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, [updateIndicatorPosition, isProjectPage]);

  // Stabilized IntersectionObserver Scroll-Spy logic with Hero top-of-page check (< 50px)
  useEffect(() => {
    if (isProjectPage) return;

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: [0.1, 0.25, 0.5, 0.75],
    };

    const handleIntersection = (entries) => {
      // Guard 1: Lock out observer while manual click-to-scroll is active
      if (isManualScrolling.current) return;

      // Guard 2: Top-of-page Hero section check (< 50px)
      if (window.scrollY < 50) {
        setActiveSection(null);
        return;
      }

      // Guard 3: Force 'contact' tab active if user is at the bottom of page
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        setActiveSection('contact');
        return;
      }

      // Update map of observed section intersection entries
      entries.forEach((entry) => {
        visibleSections.current[entry.target.id] = entry;
      });

      // Filter to only sections currently intersecting inside the focal rootMargin zone
      const activeEntries = Object.values(visibleSections.current).filter(
        (entry) => entry.isIntersecting
      );

      if (activeEntries.length > 0) {
        // Select the single section with the highest intersection ratio
        const mostVisible = activeEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );

        if (mostVisible && mostVisible.target && mostVisible.target.id) {
          setActiveSection(mostVisible.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    NAV_LINKS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      visibleSections.current = {};
    };
  }, [isProjectPage]);

  // Recalculate indicator position whenever active section changes
  useEffect(() => {
    updateIndicatorPosition();
  }, [activeSection, updateIndicatorPosition]);

  // Cleanup scroll timer on unmount
  useEffect(() => {
    return () => {
      if (manualScrollTimer.current) {
        clearTimeout(manualScrollTimer.current);
      }
    };
  }, []);

  // Navigation Click Handler (Route-aware smooth scroll vs external home redirect)
  const handleNavClick = (e, id, targetHref) => {
    setMobileMenuOpen(false);

    if (!isProjectPage) {
      e.preventDefault();
      // Immediately update active tab state
      const targetSection = id === 'top' ? null : id;
      setActiveSection(targetSection);

      // Set manual scrolling lock flag
      isManualScrolling.current = true;

      if (manualScrollTimer.current) {
        clearTimeout(manualScrollTimer.current);
      }

      const unlockScroll = () => {
        isManualScrolling.current = false;
        window.removeEventListener('scrollend', unlockScroll);
      };

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', unlockScroll, { once: true });
      }
      manualScrollTimer.current = setTimeout(unlockScroll, 800);

      // Trigger smooth scroll to target section
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetEl = document.getElementById(id);
        if (targetEl) {
          const navOffset = 90;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    } else {
      // On project detail sub-pages: Redirect to main landing page target section
      if (typeof window !== 'undefined') {
        window.location.href = targetHref || `/#${id}`;
      }
    }
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div
        className={`max-w-7xl mx-auto px-6 py-2.5 rounded-2xl pointer-events-auto transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'opacity-100 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 shadow-xl shadow-black/60'
            : 'opacity-40 hover:opacity-100 bg-transparent border-transparent shadow-none'
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Brand Logo - Always returns to main portfolio home '/' */}
          <a
            href={!isProjectPage ? '#top' : '/'}
            onClick={(e) => handleNavClick(e, 'top', '/')}
            className="group flex items-center space-x-1.5 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <span className="font-mono text-[#F75142] group-hover:rotate-12 transition-transform duration-300">
              &lt;
            </span>
            <span>Tiam</span>
            <span className="text-[#C1AB85] font-light">Designs</span>
            <span className="font-mono text-[#F75142] group-hover:-rotate-12 transition-transform duration-300">
              /&gt;
            </span>
          </a>

          {/* Middle Navigation - Conditional based on Main Page vs Project Detail Page */}
          {!isProjectPage ? (
            /* Main Landing Page: Anchor Section Links mapped over NAV_LINKS */
            <nav
              ref={navContainerRef}
              className="hidden md:flex items-center relative rounded-xl bg-zinc-900/60 p-1.5 border border-white/10 backdrop-blur-md shadow-inner"
            >
              {/* Active Indicator Squircle */}
              <div
                className={`absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-r from-[#F75142]/20 to-[#F75142]/10 border border-[#F75142]/40 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none ${
                  indicatorStyle.opacity === 0 ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                }}
              >
                {/* Glowing Indicator Dot */}
                <span className="absolute -top-0.5 right-2 w-1 h-1 rounded-full bg-[#F75142] shadow-[0_0_6px_#F75142]" />
              </div>

              {/* Nav Links mapped dynamically from global NAV_LINKS */}
              {NAV_LINKS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    ref={(el) => (navItemRefs.current[item.id] = el)}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id, item.href)}
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 rounded-lg flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className={`font-mono text-xs transition-colors ${
                      isActive ? 'text-[#F75142]' : 'text-zinc-600'
                    }`}>
                      #
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
          ) : (
            /* Project Detail Pages: Single High-Clarity "Back to Projects" Button */
            <a
              href="/#projects"
              onClick={(e) => handleNavClick(e, 'projects', '/#projects')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 border border-white/10 hover:border-[#F75142] rounded-xl shadow-inner transition-all duration-300 hover:shadow-[0_0_15px_rgba(247,81,66,0.25)] group"
            >
              <span className="text-[#F75142] group-hover:-translate-x-1 transition-transform duration-200">
                &larr;
              </span>
              <span>Back to Projects</span>
            </a>
          )}

          {/* Action / Contact CTA Button (Right) */}
          <div className="hidden md:flex items-center">
            <a
              href={!isProjectPage ? '#contact' : '/#contact'}
              onClick={(e) => handleNavClick(e, 'contact', '/#contact')}
              className="relative group inline-flex items-center justify-center px-4 py-2 text-xs font-mono tracking-wider text-white uppercase bg-zinc-900 border border-zinc-700/80 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#F75142] hover:shadow-[0_0_15px_rgba(247,81,66,0.3)] active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#F75142] to-[#cc4235] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F75142] group-hover:bg-white animate-pulse" />
                Let's Talk
              </span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F75142]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-2 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl rounded-xl transition-all duration-300">
            <div className="flex flex-col space-y-1.5">
              {!isProjectPage ? (
                NAV_LINKS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleNavClick(e, item.id, item.href)}
                      className={`px-4 py-2.5 rounded-lg text-base font-medium flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-[#F75142]/10 text-white border border-[#F75142]/30 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#F75142]">&gt;</span>
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#F75142] shadow-[0_0_8px_#F75142]" />
                      )}
                    </a>
                  );
                })
              ) : (
                <a
                  href="/#projects"
                  onClick={(e) => handleNavClick(e, 'projects', '/#projects')}
                  className="px-4 py-3 rounded-lg text-base font-mono font-medium flex items-center gap-2 text-zinc-200 bg-zinc-900/60 border border-white/10 hover:border-[#F75142] transition-colors"
                >
                  <span className="text-[#F75142]">&larr;</span>
                  <span>Back to Projects</span>
                </a>
              )}

              <div className="pt-2">
                <a
                  href={!isProjectPage ? '#contact' : '/#contact'}
                  onClick={(e) => handleNavClick(e, 'contact', '/#contact')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider text-white bg-[#F75142] rounded-xl font-semibold shadow-lg shadow-[#F75142]/20"
                >
                  Let's Talk
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


