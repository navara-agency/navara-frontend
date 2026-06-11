// One-off: convert the two oversized brand images to web-sized WebP.
// Run: node scripts/compress-heavy-images.mjs
import sharp from 'sharp'
import { stat } from 'node:fs/promises'

const jobs = [
  {
    src: 'public/brand/dark-picton-blue-abstract-creative-background-design.jpg.jpeg',
    out: 'public/brand/risk-reversal-bg.webp',
    width: 1600,
    quality: 55, // rendered at opacity 0.12 — low quality is invisible
  },
  {
    src: 'public/brand/Artboard 2@4x.png',
    out: 'public/brand/about-story.webp',
    width: 1200,
    quality: 80,
  },
]

for (const { src, out, width, quality } of jobs) {
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out)
  const before = (await stat(src)).size
  const after = (await stat(out)).size
  console.log(`${src} -> ${out}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}
