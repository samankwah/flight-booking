#!/usr/bin/env node

/**
 * Generate PWA Icons Script
 *
 * Creates placeholder PWA icons in all required sizes
 * Uses sharp library to generate PNG images
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp library not found');
  console.log('\n💡 Install sharp with: npm install sharp --save-dev\n');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, 'public', 'icons');
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BADGE_SIZE = 72;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Created icons directory');
}

/**
 * Generate a single icon
 */
async function generateIcon(size) {
  try {
    const iconPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    // Create SVG for the icon
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Gradient Background -->
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>

        <!-- Airplane Icon -->
        <g transform="translate(${size * 0.5}, ${size * 0.4})">
          <!-- Simple airplane shape -->
          <path
            d="M -${size * 0.25} 0 L ${size * 0.25} 0 L ${size * 0.15} ${size * 0.15} L -${size * 0.15} ${size * 0.15} Z"
            fill="white"
            opacity="0.9"
          />
          <circle cx="0" cy="0" r="${size * 0.06}" fill="white"/>
          <path
            d="M -${size * 0.12} ${size * 0.08} L ${size * 0.12} ${size * 0.08} L 0 ${size * 0.2} Z"
            fill="white"
            opacity="0.8"
          />
        </g>

        <!-- Text (only for larger icons) -->
        ${size >= 192 ? `
        <text
          x="50%"
          y="${size * 0.75}"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="${size * 0.12}"
          font-weight="bold"
          fill="white"
        >FlightBook</text>
        ` : ''}
      </svg>
    `;

    // Generate PNG from SVG
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(iconPath);

    console.log(`✅ Generated ${size}x${size} icon`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
    return false;
  }
}

/**
 * Generate badge icon (for notifications)
 */
async function generateBadge() {
  try {
    const badgePath = path.join(OUTPUT_DIR, `badge-${BADGE_SIZE}x${BADGE_SIZE}.png`);

    const svg = `
      <svg width="${BADGE_SIZE}" height="${BADGE_SIZE}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
          </linearGradient>
        </defs>

        <circle cx="${BADGE_SIZE / 2}" cy="${BADGE_SIZE / 2}" r="${BADGE_SIZE / 2}" fill="url(#badgeGrad)"/>

        <!-- Small airplane -->
        <g transform="translate(${BADGE_SIZE / 2}, ${BADGE_SIZE / 2})">
          <path
            d="M -${BADGE_SIZE * 0.15} 0 L ${BADGE_SIZE * 0.15} 0 L ${BADGE_SIZE * 0.08} ${BADGE_SIZE * 0.1} L -${BADGE_SIZE * 0.08} ${BADGE_SIZE * 0.1} Z"
            fill="white"
          />
        </g>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .resize(BADGE_SIZE, BADGE_SIZE)
      .png()
      .toFile(badgePath);

    console.log(`✅ Generated ${BADGE_SIZE}x${BADGE_SIZE} badge`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate badge:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function generateAllIcons() {
  console.log('🎨 Generating PWA Icons...\n');

  let successCount = 0;
  let failCount = 0;

  // Generate all icon sizes
  for (const size of ICON_SIZES) {
    const success = await generateIcon(size);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Generate badge
  const badgeSuccess = await generateBadge();
  if (badgeSuccess) {
    successCount++;
  } else {
    failCount++;
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Generated: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`\n💾 Icons saved to: ${OUTPUT_DIR}\n`);

  if (failCount === 0) {
    console.log('🎉 All icons generated successfully!\n');
    console.log('Next steps:');
    console.log('1. Refresh your browser');
    console.log('2. Check PWA manifest (should have no errors)');
    console.log('3. Test "Add to Home Screen" functionality\n');
  }
}

// Run the script
generateAllIcons().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
