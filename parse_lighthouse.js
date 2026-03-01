const fs = require('fs');

try {
    const content = fs.readFileSync('lighthouse-report-local.json', 'utf8');
    const data = JSON.parse(content);

    console.log('=== Lighthouse Scores ===');
    Object.values(data.categories).forEach(cat => {
        console.log(`${cat.title}: ${Math.round(cat.score * 100)}`);
    });

    console.log('\n=== Failed Audits ===');
    Object.values(data.audits).forEach(audit => {
        if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'informative') {
            console.log(`- ${audit.title} (Score: ${audit.score}): ${audit.description}`);
            if (audit.details && audit.details.items && audit.details.items.length > 0) {
                console.log(`  Issues found: ${audit.details.items.length}`);
            }
        }
    });
} catch (e) {
    console.error('Error parsing lighthouse report:', e.message);
}
