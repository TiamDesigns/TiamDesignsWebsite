## 2026-05-17 - Keyboard Support for Div/Span Interactive Elements
**Learning:** Found an accessibility issue pattern specific to this app's components: interactive elements (like `.skill-toggle` spans) used `role="button"` and `tabindex="0"` for screen reader and keyboard focus, but lacked JavaScript `keydown` listeners, meaning they were only activatable via mouse.
**Action:** Always verify that non-button elements styled as buttons (e.g. `span`, `div` with `role="button"`) implement `keydown` event listeners for `Enter` and `Space` keys to ensure full keyboard accessibility.
## 2024-05-21 - Explicit Form Label Binding
**Learning:** Implicit form labels (`<label><input></label>`) alone may cause issues with some screen readers or specific styling contexts where increasing the click target via explicit `for` and `id` bindings is much more reliable.
**Action:** Always prefer combining explicit (`for` and `id`) with implicit nesting for maximum accessibility robustness when designing forms.

## 2024-05-22 - Missing aria-expanded on Mobile Nav Toggle
**Learning:** The custom hamburger menu (`.nav-toggle`) lacked an `aria-expanded` attribute entirely. This meant screen reader users would not know if the navigation menu was open or closed, which is a critical piece of state for a dropdown/flyout menu.
**Action:** Always ensure that custom toggle buttons controlling visibility of other elements have an `aria-expanded` attribute that reflects the current state (true/false) and updates dynamically via JavaScript.
## 2024-05-25 - Active State for Custom Toggle Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: custom toggle filter buttons (e.g., `.filter-btn`) used visual cues (`.active` class) to indicate the selected state, but lacked the `aria-pressed` attribute to communicate this state to screen reader users.
**Action:** Always ensure that custom toggle buttons or tabs have an `aria-pressed` or `aria-selected` attribute that accurately reflects their current active state and updates dynamically via JavaScript.

## 2026-05-27 - Immediate Feedback on External Form Submission
**Learning:** Found an interaction issue where forms handled by external services (like Formspree) triggering page redirects lacked progressive enhancement, leaving users without immediate visual feedback upon submission.
**Action:** For forms handled by external services that trigger page redirects, UX improvements should include progressive enhancement on the `submit` event (e.g., disabling the submit button, updating text to "Sending...", and changing styles) to provide immediate visual feedback before the redirect.

## 2026-06-13 - Native Tooltips for Icon-Only Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: programmatic icon-only buttons (like the Lightbox controls) were created with `aria-label`s for screen readers but lacked native `title` attributes. This meant sighted users relying on mouse hover had no tooltips to understand the button's function.
**Action:** Always ensure that icon-only buttons (especially those generated programmatically) pair `aria-label` with a native `title` attribute so both assistive technologies and mouse users receive function descriptions.
