# Tiam Designs Website - Workspace Engineering & Design Guidelines

## 1. Project Philosophy & Identity
- **Brand Identity**: Tiam Designs — Industrial Design & Hardware Engineering portfolio.
- **Aesthetic Tone**: Premium, industrial, high-precision dark theme (`#101214`), minimalist typography (Inter + JetBrains Mono), crisp line weights, subtle borders (`rgba(255, 255, 255, 0.08)`), and responsive grid systems.
- **Target Audience**: Hardware engineering recruiters, industrial design clients, design engineering directors.

## 2. Technology Stack & Architecture
- **Structure**: Semantic HTML5 (accessible landmarks `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **Styling**: Modern Vanilla CSS (`assets/styles.css`). Clean CSS Custom Properties (CSS variables) for theme tokens. Avoid Tailwind unless explicitly requested.
- **JavaScript**: Modular vanilla JavaScript with event delegation, passive scroll listeners, and debounced wheel/touch handlers.
- **Testing**: Jest with JSDOM and `@testing-library/dom` for component and DOM interaction verification.
- **Deployment**: Static hosting with Netlify (`netlify.toml`), Cloudflare Pages (`wrangler.toml`), and Vercel (`vercel.json`).

## 3. Performance & Asset Standards
- **Font Optimization**: Preconnect to Google Fonts with asynchronous print/preload stylesheet swaps and system font fallbacks.
- **Images**: Responsive, high-resolution WebP/PNG assets with explicit aspect ratios to avoid Cumulative Layout Shift (CLS).
- **SEO & Meta**: Rich Open Graph meta tags, structured Schema.org markup (`Person`, `CreativeWork`, `VisualArtwork`), and descriptive alt text for industrial design renders.
