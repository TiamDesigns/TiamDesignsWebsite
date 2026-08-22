---
name: vanilla-web-performance
description: Patterns for high-performance Vanilla JS and CSS web development, zero-dependency animations, DOM testing with Jest, and asset optimization.
---

# Vanilla Web Performance & Testing Guide

Best practices for zero-dependency, ultra-fast static web applications.

## Performance Checklist
1. **Zero-Dependency Core**: Use Vanilla JS with modern ES6+ syntax (`IntersectionObserver`, `ResizeObserver`, CSS Grid, Flexbox).
2. **Smooth Micro-Animations**: Rely on CSS transitions and `transform` / `opacity` properties to ensure 60fps GPU acceleration. Avoid animating `top`, `left`, `margin`, or `width`.
3. **Scroll & Touch Handlers**: Always use `{ passive: true }` for scroll and wheel listeners, and debounce high-frequency events using `requestAnimationFrame`.
4. **Automated Testing**: Write Jest unit and integration tests under `/tests` using JSDOM to verify DOM mutations, mobile nav toggles, and modal states.
