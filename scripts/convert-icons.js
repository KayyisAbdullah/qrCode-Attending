/* eslint-disable */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

const conversions = [
  // Main icons at various sizes (generated from 512x512)
  { input: 'icon-512x512.svg', size: 72, output: 'icon-72x72.png' },
  { input: 'icon-512x512.svg', size: 96, output: 'icon-96x96.png' },
  { input: 'icon-512x512.svg', size: 128, output: 'icon-128x128.png' },
  { input: 'icon-512x512.svg', size: 144, output: 'icon-144x144.png' },
  { input: 'icon-512x512.svg', size: 152, output: 'icon-152x152.png' },
  { input: 'icon-192x192.svg', size: 192 },
  { input: 'icon-512x512.svg', size: 384, output: 'icon-384x384.png' },
  { input: 'icon-512x512.svg', size: 512 },
  // Maskable icons
  { input: 'icon-192x192-maskable.svg', size: 192, output: 'icon-192x192-maskable.png' },
  { input: 'icon-512x512-maskable.svg', size: 512, output: 'icon-512x512-maskable.png' },
  // Shortcuts
  { input: 'shortcut-admin-96.svg', size: 96 },
  { input: 'shortcut-student-96.svg', size: 96 },
  { input: 'shortcut-scan-96.svg', size: 96 },
];

async function convertIcons() {
  console.log('Converting SVG icons to PNG...\n');

  for (const conversion of conversions) {
    const inputPath = path.join(iconsDir, conversion.input);
    const outputFile = conversion.output || conversion.input.replace('.svg', '.png');
    const outputPath = path.join(iconsDir, outputFile);

    try {
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  Skipped: ${conversion.input} (file not found)`);
        continue;
      }

      // Read SVG and convert to PNG
      const svgBuffer = fs.readFileSync(inputPath);
      
      await sharp(svgBuffer)
        .resize(conversion.size, conversion.size, {
          fit: 'cover',
          withoutEnlargement: false,
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Converted: ${conversion.input} → ${outputFile}`);
    } catch (error) {
      console.error(`❌ Error converting ${conversion.input}:`, error.message);
    }
  }

  console.log('\n✅ Icon conversion complete!');
}

convertIcons();
