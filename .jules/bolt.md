## 2023-10-27 - Canvas Stroke API Overhead
**Learning:** In canvas rendering loops connecting many nodes, changing `strokeStyle` and calling `stroke()` per line scales quadratically and generates severe CPU overhead.
**Action:** Always batch canvas lines by styling attributes (like quantizing opacity into bins), stringing lines together with `moveTo` and `lineTo`, and executing a single `stroke()` call per bin.
## 2023-11-20 - 3D Render Loop CPU/GPU Waste
**Learning:** Three.js `requestAnimationFrame` loops run continuously even when the canvas is scrolled completely out of view, silently wasting significant GPU/CPU cycles on static, non-visible pixels.
**Action:** Always wrap continuous `requestAnimationFrame` loops for WebGL canvases with an `IntersectionObserver` that pauses the animation when `isIntersecting` is false.

## 2024-05-19 - Scroll Event Performance
**Learning:** Attaching continuous, unthrottled event listeners for `scroll` events that perform DOM reads (like `window.scrollY`) and writes (`classList.add`) will severely block the main thread and drop frames, as they trigger synchronous restyles for every pixel scrolled.
**Action:** Always throttle scroll listeners using `requestAnimationFrame`, decouple the DOM write from the scroll event dispatch via a boolean lock (`isScrolling`), and declare the event listener as `{ passive: true }` to explicitly opt-out of `preventDefault()` and improve browser scroll performance.
