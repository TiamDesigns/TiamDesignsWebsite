## 2023-10-27 - Canvas Stroke API Overhead
**Learning:** In canvas rendering loops connecting many nodes, changing `strokeStyle` and calling `stroke()` per line scales quadratically and generates severe CPU overhead.
**Action:** Always batch canvas lines by styling attributes (like quantizing opacity into bins), stringing lines together with `moveTo` and `lineTo`, and executing a single `stroke()` call per bin.
## 2023-11-20 - 3D Render Loop CPU/GPU Waste
**Learning:** Three.js `requestAnimationFrame` loops run continuously even when the canvas is scrolled completely out of view, silently wasting significant GPU/CPU cycles on static, non-visible pixels.
**Action:** Always wrap continuous `requestAnimationFrame` loops for WebGL canvases with an `IntersectionObserver` that pauses the animation when `isIntersecting` is false.

## 2024-05-19 - Scroll Event Performance
**Learning:** Attaching continuous, unthrottled event listeners for `scroll` events that perform DOM reads (like `window.scrollY`) and writes (`classList.add`) will severely block the main thread and drop frames, as they trigger synchronous restyles for every pixel scrolled.
**Action:** Always throttle scroll listeners using `requestAnimationFrame`, decouple the DOM write from the scroll event dispatch via a boolean lock (`isScrolling`), and declare the event listener as `{ passive: true }` to explicitly opt-out of `preventDefault()` and improve browser scroll performance.
## 2024-05-24 - Layout Thrashing in Wheel Event Listener
**Learning:** High-frequency event listeners like `wheel` that execute without `passive: true` can cause significant layout thrashing if they read layout properties like `document.body.offsetHeight`. In this codebase, the elastic overscroll effect read this value synchronously on every single scroll tick, even when overscroll wasn't applicable, causing a measurable performance bottleneck.
**Action:** Always implement fast paths/early returns in high-frequency event listeners before querying DOM layout properties. Conditionally read layout-forcing properties only when absolutely necessary (e.g., calculating `offsetHeight` only when the user is scrolling down towards the bottom boundary).
## 2024-05-25 - Window Resize Layout Thrashing and GC Spikes
**Learning:** Binding expensive operations directly to the `window.addEventListener('resize')` event causes severe continuous layout thrashing and garbage collection spikes. Browsers fire the resize event multiple times per second during window resizing. If layout properties (like `getBoundingClientRect()`, grid calculations, or `offsetHeight`) are read or written, or memory allocations (like setting canvas dimensions) occur synchronously on every fire, it tanks performance.
**Action:** Always wrap heavy layout calculations or memory re-allocations in a `debounce` function (e.g., using `setTimeout(..., 150)`) when binding to the `resize` event to ensure the heavy operations only execute once the user has stopped resizing.
