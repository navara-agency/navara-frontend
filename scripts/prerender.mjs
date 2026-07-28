/**
 * Build-time prerender.
 *
 * Why this exists: every route used to serve the same ~5 KB empty shell. The
 * title, description and body content only appeared after React booted, so to a
 * crawler all six URLs looked identical and empty. Combined with the language
 * being read from localStorage, that meant Google saw one English shell and
 * nothing else.
 *
 * This walks each locale x route in a real browser and writes the resulting HTML
 * to disk, so every URL ships its own content, <html lang>/<dir>, canonical and
 * hreflang set.
 *
 * Note the app still mounts with createRoot (not hydrateRoot), so React replaces
 * this markup on load rather than hydrating it. That is fine and intentional:
 * the purpose here is to give crawlers and link unfurlers real HTML, not to
 * skip client rendering. It also means there is no hydration-mismatch class of
 * bug to worry about.
 *
 * Failure is non-fatal by design — a build environment without Chromium should
 * still produce a working (if unprerendered) site rather than a red deploy.
 */
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LOCALES,
  DEFAULT_LOCALE,
  PUBLIC_ROUTES,
  HREFLANG,
  SITE_URL,
  absoluteUrl,
} from '../src/config/locales.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')
const PORT = 4178

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

/** Minimal static server with SPA fallback, mirroring the Vercel rewrite. */
function serveDist() {
  return new Promise((resolvePromise) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
        const filePath = join(DIST, decodeURIComponent(url.pathname))
        const ext = extname(filePath)

        if (ext && existsSync(filePath)) {
          const body = await readFile(filePath)
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
          res.end(body)
          return
        }

        // Anything without a file extension falls back to the SPA shell.
        const shell = await readFile(join(DIST, 'index.html'))
        res.writeHead(200, { 'Content-Type': MIME['.html'] })
        res.end(shell)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })

    server.listen(PORT, '127.0.0.1', () => resolvePromise(server))
  })
}

/** Build the full reciprocal hreflang set. Every page links to every variant, itself included. */
function alternatesFor(route) {
  const links = []

  for (const loc of LOCALES) {
    for (const tag of HREFLANG[loc]) {
      links.push({ hreflang: tag, href: absoluteUrl(loc, route) })
    }
  }

  // Arabic is the primary market, so unmatched languages land there.
  links.push({ hreflang: 'x-default', href: absoluteUrl(DEFAULT_LOCALE, route) })

  return links
}

/** Where a prerendered route is written. Both forms are emitted so the host can serve either. */
function outputPaths(locale, route) {
  const isDefault = locale === DEFAULT_LOCALE
  const paths = []

  if (route === '/') {
    paths.push(join(DIST, locale, 'index.html'))
    // The default locale also owns `/`, which doubles as the SPA fallback shell.
    if (isDefault) paths.push(join(DIST, 'index.html'))
  } else {
    const clean = route.replace(/^\//, '')
    paths.push(join(DIST, locale, `${clean}.html`))
    paths.push(join(DIST, locale, clean, 'index.html'))
    if (isDefault) {
      paths.push(join(DIST, `${clean}.html`))
      paths.push(join(DIST, clean, 'index.html'))
    }
  }

  return paths
}

async function launchChromium() {
  const { chromium } = await import('playwright')

  try {
    return await chromium.launch({ args: ['--no-sandbox'] })
  } catch {
    // Common on clean CI images: the package is installed but the browser binary isn't.
    console.warn('[prerender] Chromium not found — attempting to install it…')
    execSync('npx --yes playwright install chromium', { stdio: 'inherit' })
    return chromium.launch({ args: ['--no-sandbox'] })
  }
}

async function run() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html missing — did vite build run? Skipping.')
    return
  }

  const server = await serveDist()
  let browser

  try {
    browser = await launchChromium()
  } catch (err) {
    server.close()
    console.warn(`[prerender] Could not launch a browser, leaving SPA output as-is: ${err.message}`)
    return
  }

  const context = await browser.newContext({
    // A desktop viewport so lazy/responsive components render their real content.
    viewport: { width: 1280, height: 900 },
    userAgent: 'NavaraPrerender/1.0 (+https://navaraagency.com)',
  })

  // Lets the app skip work that should not influence the static output —
  // currently the deferred live-translation fetch.
  await context.addInitScript(() => { window.__PRERENDER__ = true })

  let written = 0
  let failed = 0

  for (const locale of LOCALES) {
    for (const route of PUBLIC_ROUTES) {
      const path = `/${locale}${route === '/' ? '/' : route}`
      const page = await context.newPage()

      try {
        await page.goto(`http://127.0.0.1:${PORT}${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        })

        // Wait for the app to actually paint something, then let the network
        // settle. networkidle can never arrive if the API is unreachable during
        // the build, so it is best-effort only.
        await page.waitForSelector('main h1, main h2', { timeout: 20_000 })
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {})

        const canonical = absoluteUrl(locale, route)

        await page.evaluate(({ canonical, alternates, locale }) => {
          const head = document.head

          // The per-page <Helmet> canonical is hardcoded to the unprefixed URL,
          // so replace it with the locale-correct one rather than leaving two.
          head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
            .forEach((node) => node.remove())

          const canonicalEl = document.createElement('link')
          canonicalEl.setAttribute('rel', 'canonical')
          canonicalEl.setAttribute('href', canonical)
          head.appendChild(canonicalEl)

          for (const alt of alternates) {
            const link = document.createElement('link')
            link.setAttribute('rel', 'alternate')
            link.setAttribute('hreflang', alt.hreflang)
            link.setAttribute('href', alt.href)
            head.appendChild(link)
          }

          let ogUrl = head.querySelector('meta[property="og:url"]')
          if (!ogUrl) {
            ogUrl = document.createElement('meta')
            ogUrl.setAttribute('property', 'og:url')
            head.appendChild(ogUrl)
          }
          ogUrl.setAttribute('content', canonical)

          let ogLocale = head.querySelector('meta[property="og:locale"]')
          if (!ogLocale) {
            ogLocale = document.createElement('meta')
            ogLocale.setAttribute('property', 'og:locale')
            head.appendChild(ogLocale)
          }
          ogLocale.setAttribute('content', locale === 'ar' ? 'ar_EG' : 'en_US')

          // Belt and braces: these are set by LocaleProvider, but assert them so
          // the static file is correct even if a render is interrupted.
          document.documentElement.lang = locale
          document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        }, { canonical, alternates: alternatesFor(route), locale })

        const html = await page.content()

        for (const outPath of outputPaths(locale, route)) {
          await mkdir(dirname(outPath), { recursive: true })
          await writeFile(outPath, html, 'utf8')
        }

        written += 1
        console.log(`[prerender] ${path} → ${(html.length / 1024).toFixed(1)} KB`)
      } catch (err) {
        failed += 1
        console.warn(`[prerender] FAILED ${path}: ${err.message}`)
      } finally {
        await page.close()
      }
    }
  }

  await browser.close()
  server.close()

  console.log(`[prerender] ${written} page(s) written, ${failed} failed. Site: ${SITE_URL}`)

  // A partial run still leaves a working site, so don't fail the build — but do
  // make it loud enough to notice in deploy logs.
  if (failed > 0) {
    console.warn('[prerender] Some routes did not prerender and will fall back to the SPA shell.')
  }
}

run().catch((err) => {
  console.warn(`[prerender] Skipped due to an unexpected error: ${err.message}`)
})
