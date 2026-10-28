// Copies only the public site into dist/ so tooling (tests, package files,
// configs) is not deployed. Every project file under assets/ is kept,
// including CAD, spreadsheets and PDFs, so reviewers can download them.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.resolve(root, process.argv[2] || 'dist');

const ROOT_FILES = ['robots.txt', 'sitemap.xml', '_headers', '_redirects'];
const SKIP_DIRS = new Set(['__tests__']);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function build() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  for (const file of [...pages, ...ROOT_FILES]) {
    const from = path.join(root, file);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(outDir, file));
  }
  copyDir(path.join(root, 'assets'), path.join(outDir, 'assets'));

  console.log(`Built ${pages.length} pages into ${path.relative(root, outDir) || outDir}`);
}

if (require.main === module) build();

module.exports = { build };
