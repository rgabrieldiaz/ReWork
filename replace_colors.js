const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace Tailwind arbitrary classes and raw hex codes
    content = content.replace(/bg-\[\#13ec5b\]/g, 'bg-accent-teal');
    content = content.replace(/text-\[\#13ec5b\]/g, 'text-accent-teal');
    content = content.replace(/border-\[\#13ec5b\]/g, 'border-accent-teal');
    content = content.replace(/hover:bg-\[\#11cc4e\]/g, 'hover:bg-accent-teal/80');
    content = content.replace(/hover:text-\[\#11cc4e\]/g, 'hover:text-accent-teal/80');
    content = content.replace(/hover:border-\[\#13ec5b\]/g, 'hover:border-accent-teal');
    content = content.replace(/focus:border-\[\#13ec5b\]/g, 'focus:border-accent-teal');
    content = content.replace(/from-\[\#13ec5b\]/g, 'from-accent-teal');
    content = content.replace(/to-\[\#13ec5b\]/g, 'to-accent-teal');
    content = content.replace(/via-\[\#13ec5b\]/g, 'via-accent-teal');
    content = content.replace(/bg-\[\#13ec5b\]\/(\d+)/g, 'bg-accent-teal/$1');
    content = content.replace(/border-\[\#13ec5b\]\/(\d+)/g, 'border-accent-teal/$1');
    content = content.replace(/text-\[\#13ec5b\]\/(\d+)/g, 'text-accent-teal/$1');

    // Replace raw hex code (e.g. in style tags or shadows)
    content = content.replace(/#13ec5b/g, '#00f2ff'); // new accent teal hex
    // Replace old glow shadows
    content = content.replace(/rgba\(19,236,91,/g, 'rgba(0,242,255,');

    content = content.replace(/bg-green-500\/10/g, 'bg-accent-teal/10');


    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const filesToUpdate = [
    'src/components/CreateAuctionModal.tsx',
    'src/components/CreateCrowdfundModal.tsx',
    'src/app/capacitacion/page.tsx',
    'src/app/marketplace/page.tsx',
    'src/app/colectas/page.tsx'
];

filesToUpdate.forEach(f => {
    const fullPath = path.join(__dirname, f);
    if (fs.existsSync(fullPath)) {
        replaceInFile(fullPath);
    }
});
