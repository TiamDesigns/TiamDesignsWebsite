const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
global.window = window;
global.document = window.document;

window.requestAnimationFrame = (cb) => { cb(); return 1; };
window.cancelAnimationFrame = () => {};
window.IntersectionObserver = class IntersectionObserver { constructor() {} observe() {} unobserve() {} };
window.anime = () => {};
window.anime.stagger = () => {};
window.anime.set = () => {};
window.anime.timeline = () => ({ add: () => ({ add: () => ({ add: () => ({ add: () => {} }) }) }) });
window.anime.remove = () => {};

let mainJs = fs.readFileSync('assets/main.js', 'utf8');
const script = window.document.createElement('script');
script.textContent = mainJs;
window.document.body.appendChild(script);

setTimeout(() => {
    Object.defineProperty(window, 'innerHeight', { value: 600 });
    Object.defineProperty(window.document.body, 'offsetHeight', { value: 2000 });
    window.scrollY = 1400; // bottom: 600 + 1400 = 2000

    let isAtBottom;
    if (100 > 0 || 0 !== 0) {
      isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1;
    }
    console.log("isAtBottom condition:", Math.ceil(window.innerHeight + window.scrollY), ">=", document.body.offsetHeight - 1);
    console.log("isAtBottom:", isAtBottom);

    // Test the logic directly
    const event = new window.WheelEvent('wheel', { deltaY: 10 });
    window.document.dispatchEvent(event);

    console.log("transform after dispatch:", window.document.body.style.transform);
}, 100);
