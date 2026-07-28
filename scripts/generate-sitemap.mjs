// Generates dist/sitemap.xml with reciprocal hreflang alternates.
//
// The previous sitemap was hand-maintained, listed only the 6 English URLs and
// carried invented `lastmod` dates. Since Arabic now has its own URLs, the
// sitemap has to declare both language versions of every page and link them via
// xhtml:link alternates — otherwise Google is liable to read the two trees as
// duplicates and pick one arbitrarily.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')

const SITE_URL = 'https://navaraagency.com'

// Keep in sync with src/lib/locale.js.
const ROUTES = [
  { slug: '', priority: '1.0', changefreq: 'weekly' },
  { slug: 'services', priority: '0.9', changefreq: 'monthly' },
  { slug: 'contact', priority: '0.9', changefreq: 'monthly' },
  { slug: 'about', priority: '0.8', changefreq: 'monthly' },
  { slug: 'industries', priority: '0.8', changefreq: 'monthly' },
  { slug: 'how-we-work', priority: '0.7', changefreq: 'monthly' },
]

function urlFor(locale, slug) {
  const base = locale === 'en' ? `${SITE_URL}/en` : SITE_URL
  return slug ? `${base}/${slug}` : base || SITE_URL
}

// Build date, not a fabricated one — an inaccurate lastmod trains Google to
// ignore the field entirely.
const lastmod = new Date().toISOString().slice(0, 10)

function entry(locale, { slug, priority, changefreq }) {
  const alternates = ['ar', 'en']
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, slug)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('ar', slug)}"/>`)
    .join('\n')

  return [
    '  <url>',
    `    <loc>${urlFor(locale, slug)}</loc>`,
    alternates,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

const body = ['ar', 'en'].flatMap((locale) => ROUTES.map((route) => entry(locale, route))).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`

await mkdir(DIST, { recursive: true })
await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8')
console.log(`Wrote dist/sitemap.xml (${ROUTES.length * 2} URLs).`)
