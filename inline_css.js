const fs = require('fs');

const cssContent = fs.readFileSync('assets/styles.min.css', 'utf8');
const files = ['index.html', 'sample-subway.html', 'thesis-project.html', 'Titan65.html'];

files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');

    // 1. Replace styles.css references with inline styles
    // We look for: <link rel="stylesheet" href="assets/styles.css?v=..." />
    // or similar.
    const cssRegex = /<link\s+rel="stylesheet"\s+href="assets\/styles\.css[^>]*>/g;
    html = html.replace(cssRegex, `<style>\n${cssContent}\n</style>`);

    // 2. Fix Google Fonts to be non-blocking
    // Find Google Fonts link: <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
    // or <link rel="stylesheet" href="https://fonts...
    const fontRegex = /<link[^>]*href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"[^>]*>/i;
    const fontMatch = html.match(fontRegex);

    if (fontMatch) {
        const fontUrl = fontMatch[1];
        const newFontLinks = `
  <link rel="preload" href="${fontUrl}" as="style">
  <link rel="stylesheet" href="${fontUrl}" media="print" onload="this.media='all'">
  <noscript>
    <link rel="stylesheet" href="${fontUrl}">
  </noscript>
    `.trim();
        // Replace the old font link with the new block
        html = html.replace(fontMatch[0], newFontLinks);
    }

    // Handle fonts in a different format if any, but regex handles mostly.

    fs.writeFileSync(file, html, 'utf8');
    console.log(`Processed ${file}`);
});
