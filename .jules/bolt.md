## 2024-05-15 - Hero Canvas Mousemove Optimization
**Learning:** Calling `getBoundingClientRect()` inside high-frequency event listeners like `mousemove` and `touchmove` causes layout thrashing and performance degradation by blocking the main thread.
**Action:** Cache the element's position on resize and use `pageX/pageY` for relative calculations instead of querying DOM layout APIs on every event tick.
