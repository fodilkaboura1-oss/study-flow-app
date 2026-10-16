import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const publicDir = path.resolve('public');
  const iconsDir = path.join(publicDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const standardSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'));
  const maskableSvg = fs.readFileSync(path.join(iconsDir, 'icon-maskable.svg'));

  console.log('Generating PWA icons with sharp...');

  // 192x192 standard icon
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 standard icon
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 180x180 Apple Touch Icon
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 512x512 Maskable Icon
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
