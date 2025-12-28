const fs = require('fs');
const path = require('path');

// Create simple SVG icon for PWA
const createSVGIcon = (size, bgColor = '#2563eb', textColor = '#ffffff') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.1}"/>
  <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="${textColor}">TM</text>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.12}" fill="${textColor}">PRO</text>
</svg>`;
};

// Create icons directory
const iconsDir = path.join(__dirname, '../public');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for different sizes
const sizes = [64, 192, 512];
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `pwa-${size}x${size}.svg`), svgContent);
  console.log(`Created pwa-${size}x${size}.svg`);
});

// Create maskable icon (more padding for safe area)
const createMaskableIcon = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#2563eb"/>
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="#1d4ed8" rx="${innerSize * 0.1}"/>
  <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${innerSize * 0.25}" font-weight="bold" fill="#ffffff">TM</text>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${innerSize * 0.12}" fill="#ffffff">PRO</text>
</svg>`;
};

const maskableSvg = createMaskableIcon(512);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.svg'), maskableSvg);
console.log('Created maskable-icon-512x512.svg');

console.log('PWA icons generated successfully!');
console.log('Note: For production, consider using PNG icons instead of SVG for better browser support.');