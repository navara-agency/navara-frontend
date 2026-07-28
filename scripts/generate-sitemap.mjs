/**
 * Generates dist/sitemap.xml from the route manifest in src/config/locales.js.
 *
 * Replaces the hand-maintained public/sitemap.xml, which listed only the six
 * unprefixed URLs, carried no hreflang, and had a hardcoded lastmod of
 * 2026-05-06 that would silently rot.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LOCALES,
  DEFAULT_LOCALE,
  PUBLIC_ROUTES,
  HREFLANG,
  ROUTE_PRIORITY,
  SITE_URL,
  absoluteUrl,
} from '../src/config/locales.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')

// Date of the build. Accurate by construction, unlike a checked-in constant.
const LASTMOD = new Date().toISOString().slice(0, 10)

function alternateLinks(route) {
  const links = []

  for (const locale of LOCALES) {
    for (const tag of HREFLANG[locale]) {
      links.push(`      <xhtml:link rel="alternate" hreflang="${tag}" href="${absoluteUrl(locale, route)}"/>`)
    }
  }

  links.push(`      <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(DEFAULT_LOCALE, route)}"/>`)

  return links.join('\n')
}

function buildSitemap() {
  const entries = []

  for (const locale of LOCALES) {
    for (const route of PUBLIC_ROUTES) {
      entries.push(
        [
          '   <url>',
          `      <loc>${absoluteUrl(locale, route)}</loc>`,
          `      <lastmod>${LASTMOD}</lastmod>`,
          `      <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>`,
          `      <priority>${ROUTE_PRIORITY[route] || '0.5'}</priority>`,
          alternateLinks(route),
          '   </url>',
        ].join('\n')
      )
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n')
}

async function run() {
  if (!existsSync(DIST)) {
    await mkdir(DIST, { recursive: true })
  }

  const xml = buildSitemap()
  await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8')

  const count = LOCALES.length * PUBLIC_ROUTES.length
  console.log(`[sitemap] Wrote ${count} URLs to dist/sitemap.xml (lastmod ${LASTMOD}, base ${SITE_URL})`)
}

run().catch((err) => {
  console.error(`[sitemap] Failed: ${err.message}`)
  process.exitCode = 1
})
