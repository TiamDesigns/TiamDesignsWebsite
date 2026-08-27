/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Sample Subway Hero & Header UI', () => {
  let subwayHtml;
  let stylesCss;

  beforeAll(() => {
    const htmlPath = path.join(__dirname, '..', 'sample-subway.html');
    const cssPath = path.join(__dirname, '..', 'assets', 'styles.css');
    subwayHtml = fs.readFileSync(htmlPath, 'utf8');
    stylesCss = fs.readFileSync(cssPath, 'utf8');
  });

  it('includes team members and academic context in sample-subway.html hero section', () => {
    document.documentElement.innerHTML = subwayHtml;
    const heroContent = document.querySelector('.hero-content.hero-text');
    expect(heroContent).not.toBeNull();

    const teamCredits = heroContent.querySelector('.hero-team-credits');
    expect(teamCredits).not.toBeNull();

    const text = teamCredits.textContent;
    expect(text).toContain('Isaac Pinarski (Civil Eng Student)');
    expect(text).toContain('Radhe Pandey (Civil Eng Student)');
    expect(text).toContain('Eden Irwin (Chem Eng)');
    expect(text).toContain('Professor David Knox');
    expect(text).toContain('group lead');
    expect(text).toContain('rotated responsibilities');
  });

  it('configures .hero-kicker::before with double slashes // matching height and line width', () => {
    expect(stylesCss).toMatch(/\.hero-kicker::before\s*\{[^}]*content:\s*'(\/\/)';/);
    expect(stylesCss).toMatch(/\.hero-kicker::before\s*\{[^}]*-webkit-text-stroke:\s*1\.2px/);
    expect(stylesCss).toMatch(/\.hero-kicker::before\s*\{[^}]*font-size:\s*1em/);
  });
});
