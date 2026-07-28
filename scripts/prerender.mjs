// Build-time prerendering.
//
// The site is a client-rendered SPA, so without this step every URL serves an
// empty <div id="root"> to anything that doesn't execute JavaScript. Google can
// render JS, but it does so on a deferred queue and unreliably — which is the
// most likely explanation for only 3 of 6 pages being indexed after months.
//
// This renders each locale route in Chromium and writes the resulting HTML to
// disk, so crawlers get fully-formed pages (headings, copy, links, canonical,
// hreflang, JSON-LD) on the first byte. The client bundle still boots normally
// and takes over.

import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

// Install the browser into node_modules rather than a home-directory cache.
// On CI builders (Vercel included) $HOME is not part of the cached layer, so
// the default location means a ~110 MB Chromium download on every single build
// — and a build failure if that download is ever unavailable. node_modules is
// cached, so this makes the browser a normal cached dependency.
// Must be set before playwright is imported: it resolves the path at load.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= '0'

console.log('Ensuring Chromium is installed…')
execFileSync('npx', ['--yes', 'playwright', 'install', 'chromium'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

const { chromium } = await import('playwright')

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')
const PORT = Number(process.env.PRERENDER_PORT ?? 4183)
const ORIGIN = `http://127.0.0.1:${PORT}`

// Keep in sync with src/lib/locale.js. Arabic at the root, English under /en.
const ROUTE_SLUGS = ['', 'about', 'services', 'industries', 'how-we-work', 'contact']
const ROUTES = [
  ...ROUTE_SLUGS.map((r) => (r ? `/${r}` : '/')),
  ...ROUTE_SLUGS.map((r) => (r ? `/en/${r}` : '/en')),
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

function startServer() {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
    let filePath = join(DIST, urlPath)

    // Anything without a file extension is a client route — serve the SPA shell
    // and let React Router resolve it.
    if (!extname(filePath) || !existsSync(filePath)) {
      filePath = join(DIST, 'index.html')
    }

    try {
      const body = await readFile(filePath)
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
    }
  })

  return new Promise((res) => server.listen(PORT, '127.0.0.1', () => res(server)))
}

/** Where a route's HTML lands. '/' -> dist/index.html, '/en/services' -> dist/en/services/index.html */
function outputPath(route) {
  if (route === '/') return join(DIST, 'index.html')
  return join(DIST, route.replace(/^\//, ''), 'index.html')
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html not found — run `vite build` before prerendering.')
  }

  const server = await startServer()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  // Render everything first, write afterwards: dist/index.html is this server's
  // SPA fallback, so writing the Arabic home page mid-run would change what
  // every later route boots from.
  const rendered = new Map()

  try {
    for (const route of ROUTES) {
      await page.goto(ORIGIN + route, { waitUntil: 'networkidle', timeout: 45_000 })

      // Wait for React to have actually painted something into #root, rather
      // than trusting network idle alone.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root')
          return !!root && root.children.length > 0 && (root.innerText ?? '').trim().length > 200
        },
        { timeout: 30_000 }
      )

      const html = await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}`)
      rendered.set(route, html)

      const title = await page.title()
      console.log(`  prerendered ${route.padEnd(18)} ${title}`)
    }

    for (const [route, html] of rendered) {
      const target = outputPath(route)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, html, 'utf8')
    }

    console.log(`\nPrerendered ${rendered.size} routes.`)
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => {
  console.error('\nPrerender failed:', err)
  // Fail the build rather than silently shipping an empty SPA shell — that
  // failure mode is invisible in QA and catastrophic for indexing.
  process.exit(1)
})
