const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '..', 'Icon-Light-512x512.png');

// Android icon sizes
const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// iOS icon sizes (size * scale)
const iosSizes = [
  { filename: 'Icon-20@2x.png', size: 40 },
  { filename: 'Icon-20@3x.png', size: 60 },
  { filename: 'Icon-29@2x.png', size: 58 },
  { filename: 'Icon-29@3x.png', size: 87 },
  { filename: 'Icon-40@2x.png', size: 80 },
  { filename: 'Icon-40@3x.png', size: 120 },
  { filename: 'Icon-60@2x.png', size: 120 },
  { filename: 'Icon-60@3x.png', size: 180 },
  { filename: 'Icon-1024.png', size: 1024 },
];

// Padding percentage (10% on each side = logo takes 80% of space)
const PADDING_PERCENT = 0.10;
// Background color (light blue from the icon)
const BG_COLOR = { r: 232, g: 244, b: 253, alpha: 1 };

async function generateAndroidIcons() {
  const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

  for (const { folder, size } of androidSizes) {
    const outputPath = path.join(androidResPath, folder, 'ic_launcher.png');
    const roundOutputPath = path.join(androidResPath, folder, 'ic_launcher_round.png');

    // Calculate logo size with padding
    const padding = Math.round(size * PADDING_PERCENT);
    const logoSize = size - (padding * 2);

    // Resize logo smaller
    const resizedLogo = await sharp(sourceIcon)
      .resize(logoSize, logoSize, { fit: 'contain' })
      .toBuffer();

    // Create icon with padding background
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png()
      .toFile(outputPath);

    // For round icon, same with circular mask applied by Android
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png()
      .toFile(roundOutputPath);

    console.log(`Generated Android icon: ${folder} (${size}x${size}, logo: ${logoSize}x${logoSize})`);
  }
}

async function generateiOSIcons() {
  const iosIconPath = path.join(__dirname, '..', 'ios', 'uwipRN', 'Images.xcassets', 'AppIcon.appiconset');

  for (const { filename, size } of iosSizes) {
    const outputPath = path.join(iosIconPath, filename);

    // Calculate logo size with padding
    const padding = Math.round(size * PADDING_PERCENT);
    const logoSize = size - (padding * 2);

    // Resize logo smaller
    const resizedLogo = await sharp(sourceIcon)
      .resize(logoSize, logoSize, { fit: 'contain' })
      .toBuffer();

    // Create icon with padding background
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png()
      .toFile(outputPath);

    console.log(`Generated iOS icon: ${filename} (${size}x${size}, logo: ${logoSize}x${logoSize})`);
  }

  // Update Contents.json with filenames
  const contentsJson = {
    images: [
      { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'Icon-20@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'Icon-20@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'Icon-29@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'Icon-29@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'Icon-40@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'Icon-40@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'Icon-60@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'Icon-60@3x.png' },
      { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'Icon-1024.png' },
    ],
    info: { author: 'xcode', version: 1 }
  };

  fs.writeFileSync(
    path.join(iosIconPath, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('Updated iOS Contents.json');
}

async function main() {
  console.log('Generating app icons...\n');
  console.log('Source:', sourceIcon);
  console.log('');

  await generateAndroidIcons();
  console.log('');
  await generateiOSIcons();

  console.log('\nDone!');
}

main().catch(console.error);
