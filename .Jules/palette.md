## 2026-05-17 - Keyboard Support for Div/Span Interactive Elements
**Learning:** Found an accessibility issue pattern specific to this app's components: interactive elements (like `.skill-toggle` spans) used `role="button"` and `tabindex="0"` for screen reader and keyboard focus, but lacked JavaScript `keydown` listeners, meaning they were only activatable via mouse.
**Action:** Always verify that non-button elements styled as buttons (e.g. `span`, `div` with `role="button"`) implement `keydown` event listeners for `Enter` and `Space` keys to ensure full keyboard accessibility.
## 2024-05-21 - Explicit Form Label Binding
**Learning:** Implicit form labels (`<label><input></label>`) alone may cause issues with some screen readers or specific styling contexts where increasing the click target via explicit `for` and `id` bindings is much more reliable.
**Action:** Always prefer combining explicit (`for` and `id`) with implicit nesting for maximum accessibility robustness when designing forms.
