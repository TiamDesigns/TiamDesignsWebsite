const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

describe('Deploy build', () => {
  let outDir;

  beforeAll(() => {
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-build-'));
    execFileSync('node', [path.join(__dirname, '..', 'scripts', 'build.js'), outDir]);
  });

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('publishes every page and the deploy config files', () => {
    ['index.html', 'sample-subway.html', 'Titan65.html', 'thesis-project.html', '_headers', 'robots.txt', 'sitemap.xml']
      .forEach(file => expect(fs.existsSync(path.join(outDir, file))).toBe(true));
  });

  it('keeps project files downloadable, including CAD and spreadsheets', () => {
    ['SampleSubwayCAD.step', 'GNG1103 - Project.xlsx', 'Final Design.pdf']
      .forEach(file => expect(fs.existsSync(path.join(outDir, 'assets', 'SampleSubway', file))).toBe(true));
  });

  it('leaves tooling and tests out of the deploy', () => {
    ['package.json', 'package-lock.json', 'tests', 'node_modules', 'src', 'wrangler.toml', 'assets/__tests__']
      .forEach(file => expect(fs.existsSync(path.join(outDir, file))).toBe(false));
  });
});
