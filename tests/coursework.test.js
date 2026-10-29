/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Notable Coursework Section & Sample Subway Accuracy', () => {
  let indexHtml;
  let subwayHtml;
  let stylesCss;

  beforeAll(() => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const subwayPath = path.join(__dirname, '..', 'sample-subway.html');
    const cssPath = path.join(__dirname, '..', 'assets', 'styles.css');

    indexHtml = fs.readFileSync(indexPath, 'utf8');
    subwayHtml = fs.readFileSync(subwayPath, 'utf8');
    stylesCss = fs.readFileSync(cssPath, 'utf8');
  });

  describe('Sample Subway Accuracy', () => {
    it('accurately describes Arduino in index.html project card and does not claim bare-metal C', () => {
      document.documentElement.innerHTML = indexHtml;
      const subwayCard = document.querySelector('.project-card.sample-subway');
      expect(subwayCard).not.toBeNull();
      const text = subwayCard.textContent;
      expect(text).toContain('Arduino');
      expect(text.toLowerCase()).not.toContain('bare-metal');
    });

    it('accurately describes Arduino firmware in sample-subway.html and removes bare-metal exaggerations', () => {
      document.documentElement.innerHTML = subwayHtml;
      
      // Spec detail
      expect(subwayHtml).toContain('ESP32-WROOM-C3 Microcontroller (Arduino Firmware)');
      
      // Firmware section title and intro
      const firmwareSection = document.getElementById('firmware');
      expect(firmwareSection).not.toBeNull();
      const firmwareHeading = firmwareSection.querySelector('h2');
      expect(firmwareHeading.textContent).toContain('06 // ARDUINO FIRMWARE & COMMUNICATION STRATEGY');
      expect(firmwareSection.textContent).toContain('Custom Arduino firmware and Python data logging toolchain');
      
      // No bare-metal claims
      expect(subwayHtml.toLowerCase()).not.toContain('bare-metal');
    });
  });

  describe('Notable Coursework Section Structure & Placement', () => {
    beforeEach(() => {
      document.documentElement.innerHTML = indexHtml;
    });

    it('places the #coursework section immediately after #projects and before #experience', () => {
      const projects = document.getElementById('projects');
      const coursework = document.getElementById('coursework');
      const experience = document.getElementById('experience');

      expect(projects).not.toBeNull();
      expect(coursework).not.toBeNull();
      expect(experience).not.toBeNull();

      // Check DOM ordering
      const sections = Array.from(document.querySelectorAll('main > section, main section[id]'));
      const projectIndex = sections.findIndex(s => s.id === 'projects');
      const courseworkIndex = sections.findIndex(s => s.id === 'coursework');
      const experienceIndex = sections.findIndex(s => s.id === 'experience');

      expect(courseworkIndex).toBeGreaterThan(projectIndex);
      expect(experienceIndex).toBeGreaterThan(courseworkIndex);
    });

    it('includes a Coursework navigation link in the header', () => {
      const navLink = document.querySelector('.nav-links a[href="#coursework"]');
      expect(navLink).not.toBeNull();
      expect(navLink.textContent.trim()).toBe('Coursework');
    });

    it('contains all 12 required courses across relevant domain groups', () => {
      const courseworkSection = document.getElementById('coursework');
      const text = courseworkSection.textContent;

      const requiredCourses = [
        'Circuit Theory I',
        'Computer Architecture I',
        'Computer Architecture II',
        'Product Development for Engineers',
        'Intro To Engineering Design',
        'Physics I',
        'Electronics I',
        'Circuit Theory II',
        'Physics: Electricity and Magnetism',
        'Linear Algebra',
        'Calculus I, II & III',
        'Differential Equations & Numerical Methods'
      ];

      requiredCourses.forEach(course => {
        expect(text).toContain(course);
      });
    });

    it('groups engineering courses into 4 compact domain cards', () => {
      const courseworkSection = document.getElementById('coursework');
      const cards = courseworkSection.querySelectorAll('.course-track.engineering .coursework-card');
      expect(cards.length).toBe(4);

      const groupTitles = Array.from(cards).map(c => c.querySelector('.course-group-title')?.textContent.trim());
      expect(groupTitles).toContain('Computer Systems & Architecture');
      expect(groupTitles).toContain('Circuits & Electronics');
      expect(groupTitles).toContain('Mathematics & Physics');
      expect(groupTitles).toContain('Engineering Design & Methodology');
    });

    it('presents the completed Humber College Industrial Design degree as its own track', () => {
      const designTrack = document.querySelector('#coursework .course-track.design');
      expect(designTrack).not.toBeNull();

      const text = designTrack.textContent;
      expect(text).toContain('Bachelor of Industrial Design');
      expect(text).toContain('Humber College');

      const groupTitles = Array.from(designTrack.querySelectorAll('.course-group-title')).map(t => t.textContent.trim());
      expect(groupTitles).toEqual(['Industrial Design Studio', 'UX & Interaction Design', 'Graphic Design']);
      expect(designTrack.querySelector('a[href="thesis-project.html"]')).not.toBeNull();
    });

    it('correctly notes Computer Architecture I lab processor project', () => {
      const courseworkSection = document.getElementById('coursework');
      const items = Array.from(courseworkSection.querySelectorAll('.course-item'));
      const arch1 = items.find(i => i.querySelector('.course-name')?.textContent.includes('Computer Architecture I'));

      expect(arch1).toBeDefined();
      expect(arch1.textContent).toContain('Made a simple processor in lab');
    });

    it('correctly notes Computer Architecture II working with C and embedded systems as ongoing', () => {
      const courseworkSection = document.getElementById('coursework');
      const items = Array.from(courseworkSection.querySelectorAll('.course-item'));
      const arch2 = items.find(i => i.querySelector('.course-name')?.textContent.includes('Computer Architecture II'));

      expect(arch2).toBeDefined();
      expect(arch2.textContent).toContain('Working with C and embedded systems development');
      expect(arch2.textContent).toContain('ONGOING');
    });

    it('marks Circuit Theory I as ongoing', () => {
      const courseworkSection = document.getElementById('coursework');
      const items = Array.from(courseworkSection.querySelectorAll('.course-item'));
      const circuit1 = items.find(i => i.querySelector('.course-name')?.textContent.trim() === 'Circuit Theory I');

      expect(circuit1).toBeDefined();
      expect(circuit1.textContent).toContain('ONGOING');
    });

    it('marks Electronics I, Circuit Theory II, and Physics: Electricity and Magnetism for Winter 2027', () => {
      const courseworkSection = document.getElementById('coursework');
      const items = Array.from(courseworkSection.querySelectorAll('.course-item'));

      const winterCourses = [
        'Electronics I',
        'Circuit Theory II',
        'Physics: Electricity and Magnetism'
      ];

      winterCourses.forEach(title => {
        const item = items.find(i => i.querySelector('.course-name')?.textContent.includes(title));
        expect(item).toBeDefined();
        expect(item.textContent).toContain('WINTER 2027');
      });
    });

    it('marks mathematics courses as completed', () => {
      const courseworkSection = document.getElementById('coursework');
      const items = Array.from(courseworkSection.querySelectorAll('.course-item'));

      const mathCourses = [
        'Linear Algebra',
        'Calculus I, II & III',
        'Differential Equations & Numerical Methods'
      ];

      mathCourses.forEach(title => {
        const item = items.find(i => i.querySelector('.course-name')?.textContent.includes(title));
        expect(item).toBeDefined();
        expect(item.textContent).toContain('COMPLETED');
      });
    });
  });

  describe('Coursework CSS Styles', () => {
    it('defines styles for coursework-grid, coursework-card, and badges', () => {
      expect(stylesCss).toContain('.coursework-grid');
      expect(stylesCss).toContain('.coursework-card');
      expect(stylesCss).toContain('.course-item-list');
      expect(stylesCss).toContain('.course-badge.ongoing');
      expect(stylesCss).toContain('.course-badge.completed');
      expect(stylesCss).toContain('.course-badge.scheduled');
    });
  });
});
