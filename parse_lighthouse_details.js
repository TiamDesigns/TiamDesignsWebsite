const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));

['deprecations', 'render-blocking-resources', 'unminified-javascript', 'uses-optimized-images'].forEach(auditId => {
    const audit = data.audits[auditId];
    if (audit && audit.details && audit.details.items) {
        console.log(`\n=== Details for ${audit.title} ===`);
        audit.details.items.forEach(item => {
            console.log(JSON.stringify(item, null, 2));
        });
    }
});
