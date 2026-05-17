## 2023-10-27 - Canvas Stroke API Overhead
**Learning:** In canvas rendering loops connecting many nodes, changing `strokeStyle` and calling `stroke()` per line scales quadratically and generates severe CPU overhead.
**Action:** Always batch canvas lines by styling attributes (like quantizing opacity into bins), stringing lines together with `moveTo` and `lineTo`, and executing a single `stroke()` call per bin.
## 2023-11-20 - 3D Render Loop CPU/GPU Waste
**Learning:** Three.js `requestAnimationFrame` loops run continuously even when the canvas is scrolled completely out of view, silently wasting significant GPU/CPU cycles on static, non-visible pixels.
**Action:** Always wrap continuous `requestAnimationFrame` loops for WebGL canvases with an `IntersectionObserver` that pauses the animation when `isIntersecting` is false.
