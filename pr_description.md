💡 What
Added native `title` attributes to the programmatic icon-only buttons (Zoom In, Zoom Out, and Close) in the lightbox gallery component (`assets/main.js`). Updated the minified version (`assets/main.min.js`) accordingly.

🎯 Why
While the buttons already had `aria-label`s for screen readers, sighted mouse users had no visual feedback explaining the function of these icons. The `title` attribute adds native browser tooltips on hover, improving overall usability.

📸 Before/After
Before: Hovering over the lightbox controls displayed nothing.
After: Hovering displays a native tooltip (e.g., "Zoom Out", "Zoom In", "Close").

♿ Accessibility
Maintains existing `aria-label` support for screen readers while adding native tooltip support for sighted mouse users, following the guideline that programmatic icon-only buttons must pair `aria-label` with `title`.
