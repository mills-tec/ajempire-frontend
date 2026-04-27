const fs = require('fs');
const path = require('path');

// Create simple placeholder icons for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate placeholder SVG content
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#E91E63"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="120" font-weight="bold">AJ</text>
</svg>`;

// Create placeholder icon files
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Create a simple placeholder file (in real app, you'd use actual icons)
  // For now, we'll create empty files to prevent 404 errors
  fs.writeFileSync(iconPath, '');
  console.log(`Created placeholder: ${iconPath}`);
});

console.log('PWA icons created successfully!');
