#!/usr/bin/env node
/**
 * Generates favicons + PWA icons from public/brand/logo/navara-logo-on-blue.png.
 *
 * Outputs into public/:
 *   favicon.ico                     (16+32+48 multi-size, for Google + legacy browsers)
 *   favicon-16x16.png
 *   favicon-32x32.png
 *   favicon-48x48.png               (Google requires ≥48 to show in search results)
 *   favicon-192x192.png             (Android PWA)
 *   favicon-512x512.png             (Android splash)
 *   apple-touch-icon.png            (180x180, iOS home screen)
 *   og-image.png                    (1200x630, social link previews)
 *
 * Run: node scripts/generate-favicons.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

// Use the production icon-white asset (the same one the Footer renders) — clean,
// square-ish, transparent background. We composite it onto the brand-blue colour via
// sharp's flatten() below so the icon reads well at 16/32/48 px.
const SRC = path.resolve(__dirname, '..', 'public', 'brand', 'navara-logo-icon-white.png');
const OUT = path.resolve(__dirname, '..', 'public');

// Brand blue background — matches the source logo so Google sees a solid square,
// not a transparent shape that would render oddly on different backgrounds.
const BG = { r: 0x00, g: 0x11, b: 0x92, alpha: 1 };

const PNG_SIZES = [16, 32, 48, 180, 192, 512];

async function makePng(size, outputName) {
  const buf = await sharp(SRC)
    .resize(size, size, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, outputName), buf);
  console.log(`  wrote ${outputName} (${size}x${size}, ${buf.length} bytes)`);
  return buf;
}

async function makeIco(buffers) {
  const ico = await toIco(buffers);
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico);
  console.log(`  wrote favicon.ico (multi-size, ${ico.length} bytes)`);
}

async function makeOgImage() {
  // 1200x630 — standard og:image dimensions. Logo centred on brand-blue background.
  const buf = await sharp(SRC)
    .resize(630, 630, { fit: 'contain', background: BG })
    .extend({ top: 0, bottom: 0, left: 285, right: 285, background: BG })
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, 'og-image.png'), buf);
  console.log(`  wrote og-image.png (1200x630, ${buf.length} bytes)`);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Source logo not found: ${SRC}`);
    process.exit(1);
  }
  console.log(`Source: ${SRC}`);

  const buffers = {};
  for (const size of PNG_SIZES) {
    const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
    buffers[size] = await makePng(size, name);
  }

  // Multi-size ICO from 16/32/48 PNG buffers
  await makeIco([buffers[16], buffers[32], buffers[48]]);

  await makeOgImage();

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
