## 2023-10-27 - Canvas Stroke API Overhead
**Learning:** In canvas rendering loops connecting many nodes, changing `strokeStyle` and calling `stroke()` per line scales quadratically and generates severe CPU overhead.
**Action:** Always batch canvas lines by styling attributes (like quantizing opacity into bins), stringing lines together with `moveTo` and `lineTo`, and executing a single `stroke()` call per bin.
