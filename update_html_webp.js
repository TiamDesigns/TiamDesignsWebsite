const fs = require('fs');

const files = ['index.html', 'sample-subway.html', 'thesis-project.html', 'Titan65.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Regex to find <img> tags that are NOT inside a <picture> tag.
    // This is tricky with simple regex, so we'll do a string replacement approach.
    // First, find all <img src="assets/...png|jpg" ... > 
    // We'll use a replacer function.

    const imgRegex = /<img\s+([^>]*?)src="([^"]+\.(png|jpe?g))"([^>]*)>/gi;

    content = content.replace(imgRegex, (match, beforeSrc, srcPath, ext, afterSrc) => {
        // Check if this img is already in a picture tag (simple heuristic: look back a few characters)
        // Not perfect, but works for simple HTML
        const index = content.indexOf(match);
        const textBefore = content.substring(Math.max(0, index - 20), index);
        if (textBefore.includes('<picture>') || textBefore.includes('</source>')) {
            return match; // Already wrapped
        }

        // Determine the webp path
        const webpPath = srcPath.replace(/\.(png|jpe?g)$/i, '.webp');

        // Create the picture tag wrapper
        return `<picture>
  <source srcset="${webpPath}" type="image/webp">
  <img ${beforeSrc}src="${srcPath}"${afterSrc}>
</picture>`;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated images in ${file}`);
});
