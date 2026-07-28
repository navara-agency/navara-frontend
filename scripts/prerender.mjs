/**
 * Static prerender for the Vite SPA.
 *
 * Google can execute JavaScript, but rendering is queued separately and is
 * slower and less reliable than reading HTML directly — a handicap a domain
 * with no authority can't afford. This walks the public routes in a real
 * browser and writes the fully-rendered HTML back into dist/, so crawlers get
 * complete markup on the first request.
 *
 * Opt-in on purpose: `npm run build` is untouched, so the existing deploy
 * cannot regress. Run `npm run build:prerender` and inspect dist/ before
 * switching the deploy command over.
 *
 *   npm run build:prerender
 *   npx serve dist   # then view-source: and confirm the <h1> is present
 */
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const ROUTES = [
  '/', '/services', '/about', '/industries', '/how-we-work', '/contact',
  '/en', '/en/services', '/en/about', '/en/industries', '/en/how-we-work', '/en/contact',
]

const PORT = 4183
const OUT_DIR = 'dist'

function outputPathFor(route) {
  const clean = route === '/' ? '/index' : route.replace(/\/$/, '')
  return join(OUT_DIR, `${clean}.html`.replace(/^\//, ''))
}

const server = await preview({
  preview: { port: PORT, strictPort: true, open: false },
})

const browser = await chromium.launch()
const page = await browser.newPage()

let failures = 0

for (const route of ROUTES) {
  const url = `http://localhost:${PORT}${route}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    // The app renders into #root; wait for it to actually contain something.
    await page.waitForFunction(
      () => document.querySelector('#root')?.children.length > 0,
      { timeout: 15_000 },
    )

    const html = await page.content()

    // Sanity check — an empty shell means the prerender silently failed.
    if (!/<h1[\s>]/i.test(html)) {
      console.warn(`  warn  ${route} — rendered but contains no <h1>`)
    }

    const outPath = outputPathFor(route)
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html, 'utf8')
    console.log(`  ok    ${route} -> ${outPath}`)
  } catch (err) {
    failures += 1
    console.error(`  FAIL  ${route}: ${err.message}`)
  }
}

await browser.close()
await server.httpServer.close()

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failed route(s).`)
  process.exit(1)
}
console.log(`\nPrerendered ${ROUTES.length} routes into ${OUT_DIR}/.`)
