## 2026-05-17 - Keyboard Support for Div/Span Interactive Elements
**Learning:** Found an accessibility issue pattern specific to this app's components: interactive elements (like `.skill-toggle` spans) used `role="button"` and `tabindex="0"` for screen reader and keyboard focus, but lacked JavaScript `keydown` listeners, meaning they were only activatable via mouse.
**Action:** Always verify that non-button elements styled as buttons (e.g. `span`, `div` with `role="button"`) implement `keydown` event listeners for `Enter` and `Space` keys to ensure full keyboard accessibility.
## 2026-05-20 - Aria-Expanded for Toggle Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: interactive toggle elements (like `.nav-toggle` buttons) lacked the `aria-expanded` attribute, preventing screen reader users from knowing whether the associated menu or content was currently open or closed.
**Action:** Always ensure that toggle buttons (e.g., hamburger menus, accordions) dynamically update the `aria-expanded` attribute in JavaScript to accurately reflect the state of the content they control.
