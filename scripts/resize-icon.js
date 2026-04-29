const fs = require('fs');
const path = require('path');

// Create a 144x144 icon from the existing 512x512 icon
const inputIcon = path.join(__dirname, '../public/icon-512.png');
const outputIcon = path.join(__dirname, '../public/icon-144.png');

// Simple script to create a 144x144 placeholder
// In production, you'd use an actual image processing library
console.log('Creating 144x144 icon from 512x512...');

// For now, create a basic placeholder that meets the size requirement
const svgContent = `<svg width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" fill="#FF008C"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="40" font-weight="bold">AJ</text>
</svg>`;

// This would normally require an image processing library like sharp
// For now, we'll create the file structure
fs.writeFileSync(outputIcon.replace('.png', '.svg'), svgContent);
console.log('✅ Created 144x144 SVG placeholder!');
console.log('📝 Note: Replace with actual 144x144 PNG using image processing library');
