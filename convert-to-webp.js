#!/usr/bin/env node

/**
 * WebP Image Conversion Script
 *
 * Converts JPG/PNG images to WebP format for better compression
 * Requires: sharp library (npm install sharp --save-dev)
 *
 * Usage:
 *   node convert-to-webp.js
 *   node convert-to-webp.js --quality 80
 *   node convert-to-webp.js --input ./src/assets --output ./public/images
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const quality = parseInt(args.find(arg => arg.startsWith('--quality'))?.split('=')[1] || '85');
const inputDir = args.find(arg => arg.startsWith('--input'))?.split('=')[1] || './public/images';
const outputDir = args.find(arg => arg.startsWith('--output'))?.split('=')[1] || inputDir;

console.log('📸 WebP Image Conversion Tool\n');
console.log(`Input directory: ${inputDir}`);
console.log(`Output directory: ${outputDir}`);
console.log(`Quality: ${quality}%\n`);

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp library not found');
  console.log('\n💡 Install sharp with: npm install sharp --save-dev\n');
  process.exit(1);
}

// Supported image formats
const IMAGE_FORMATS = ['.jpg', '.jpeg', '.png'];

/**
 * Convert a single image to WebP
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    if (!IMAGE_FORMATS.includes(ext)) {
      return { success: false, reason: 'Unsupported format' };
    }

    const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Skip if WebP version already exists and is newer
    if (fs.existsSync(webpPath)) {
      const inputStats = fs.statSync(inputPath);
      const webpStats = fs.statSync(webpPath);

      if (webpStats.mtime > inputStats.mtime) {
        return { success: true, skipped: true };
      }
    }

    const inputSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(webpPath);

    const outputSize = fs.statSync(webpPath).size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    return {
      success: true,
      inputSize,
      outputSize,
      savings,
      path: webpPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Recursively find all images in directory
 */
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_FORMATS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Convert all images in directory
 */
async function convertDirectory() {
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Error: Input directory '${inputDir}' not found\n`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🔍 Finding images...\n');
  const images = findImages(inputDir);

  if (images.length === 0) {
    console.log('ℹ️  No images found in the specified directory\n');
    return;
  }

  console.log(`Found ${images.length} images\n`);
  console.log('Converting...\n');

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let totalSaved = 0;

  for (const imagePath of images) {
    const relativePath = path.relative(inputDir, imagePath);
    const outputPath = path.join(outputDir, relativePath);

    // Ensure output directory exists
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }

    const result = await convertToWebP(imagePath, outputPath);

    if (result.success) {
      if (result.skipped) {
        console.log(`⏭️  Skipped: ${relativePath} (already up to date)`);
        skipped++;
      } else {
        const savedKB = ((result.inputSize - result.outputSize) / 1024).toFixed(1);
        totalSaved += result.inputSize - result.outputSize;
        console.log(`✅ Converted: ${relativePath} (saved ${savedKB}KB, ${result.savings}% reduction)`);
        converted++;
      }
    } else {
      console.log(`❌ Failed: ${relativePath} - ${result.error || result.reason}`);
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Converted: ${converted}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB\n`);
}

// Run conversion
convertDirectory().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

/**
 * ALTERNATIVE: Browser-based conversion
 *
 * If you don't want to use Node.js, you can use online tools:
 * - https://squoosh.app/ (Google's image optimizer)
 * - https://www.freeconvert.com/webp-converter
 * - https://cloudconvert.com/png-to-webp
 *
 * Or use Photoshop/GIMP with WebP plugin
 */
