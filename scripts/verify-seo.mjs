// Post-build assertion that the prerendered output is actually indexable.
//
// The failure modes this catches are all silent: duplicate <title>/description
// tags, an English page canonicalising to its Arabic twin, a broken hreflang
// pair, or a route that shipped an empty shell because prerendering skipped it.
// None of those throw at build time and none are visible in QA — they just
// quietly cost you indexing. Failing the build is the cheapest place to catch them.

import fs from 'node:fs'
import p from 'node:path'

const SITE = 'https://navaraagency.com'
const slugs = ['', 'about', 'services', 'industries', 'how-we-work', 'contact']
const routes = [...slugs.map((s) => (s ? '/' + s : '/')), ...slugs.map((s) => (s ? '/en/' + s : '/en'))]

let fail = 0
const bad = (msg) => { console.log('  FAIL ' + msg); fail++ }

for (const route of routes) {
  const file = route === '/' ? 'dist/index.html' : p.join('dist', route.slice(1), 'index.html')
  if (!fs.existsSync(file)) { bad(route + ' -> missing ' + file); continue }
  // Strip HTML comments first — comment prose that mentions tag names would
  // otherwise be counted as real tags.
  const h = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '')

  const titles = h.match(/<title[^>]*>[\s\S]*?<\/title>/g) || []
  const descs = h.match(/<meta[^>]*name="description"[^>]*>/g) || []
  const canon = [...h.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map((m) => m[1])
  const alts = [...h.matchAll(/<link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => m[1] + '=' + m[2])
  const lang = (h.match(/<html[^>]*\blang="([^"]+)"/) || [])[1]
  const dir = (h.match(/<html[^>]*\bdir="([^"]+)"/) || [])[1]
  const ogTitle = h.match(/<meta[^>]*property="og:title"[^>]*>/g) || []

  const expectLocale = route.startsWith('/en') ? 'en' : 'ar'
  const expectSlug = route.replace(/^\/en/, '').replace(/^\//, '')
  const expectCanon = SITE + (expectLocale === 'en' ? '/en' : '') + (expectSlug ? '/' + expectSlug : '')
  const expectAlts = [
    'ar=' + SITE + (expectSlug ? '/' + expectSlug : '/'),
    'en=' + SITE + '/en' + (expectSlug ? '/' + expectSlug : ''),
    'x-default=' + SITE + (expectSlug ? '/' + expectSlug : '/'),
  ]

  console.log(route)
  if (titles.length !== 1) bad(route + ' has ' + titles.length + ' <title> tags')
  if (descs.length !== 1) bad(route + ' has ' + descs.length + ' meta descriptions')
  if (ogTitle.length !== 1) bad(route + ' has ' + ogTitle.length + ' og:title tags')
  if (canon.length !== 1) bad(route + ' has ' + canon.length + ' canonicals')
  else if (canon[0].replace(/\/$/, '') !== expectCanon.replace(/\/$/, '')) bad(route + ' canonical=' + canon[0] + ' expected ' + expectCanon)
  if (lang !== expectLocale) bad(route + ' html lang=' + lang + ' expected ' + expectLocale)
  if (dir !== (expectLocale === 'ar' ? 'rtl' : 'ltr')) bad(route + ' html dir=' + dir)
  for (const a of expectAlts) if (!alts.includes(a)) bad(route + ' missing hreflang ' + a + ' (got ' + alts.join(', ') + ')')

  // Crawler-visible body content
  const body = (h.match(/<body[\s\S]*<\/body>/) || [''])[0]
  const text = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length < 1000) bad(route + ' body text only ' + text.length + ' chars')
  const links = [...body.matchAll(/<a[^>]*href="(\/[^"]*)"/g)].map((m) => m[1])
  const crossLocale = links.filter((l) => (expectLocale === 'en' ? !l.startsWith('/en') && !l.startsWith('/dashboard') : l.startsWith('/en')))
  if (expectLocale === 'en' && crossLocale.length > 1) bad(route + ' has ' + crossLocale.length + ' links leaving /en: ' + crossLocale.slice(0, 5).join(', '))
  console.log('  title: ' + titles[0].replace(/<\/?title[^>]*>/g, '').slice(0, 70))
  console.log('  canonical: ' + canon[0] + ' | text ' + text.length + ' chars | ' + links.length + ' internal links')
}

const sm = fs.readFileSync('dist/sitemap.xml', 'utf8')
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
console.log('\nsitemap: ' + locs.length + ' urls')
if (locs.length !== 12) bad('sitemap has ' + locs.length + ' urls, expected 12')

const idx = fs.readFileSync('dist/index.html', 'utf8')
if (!/"sameAs"/.test(idx)) bad('sameAs missing from schema')
if (!/linkedin\.com\/company\/navara-agency/.test(idx)) bad('linkedin sameAs wrong')
if (!/instagram\.com\/navara_agency/.test(idx)) bad('instagram sameAs wrong')

console.log(fail === 0 ? '\nALL CHECKS PASSED' : '\n' + fail + ' CHECKS FAILED')
process.exit(fail === 0 ? 0 : 1)
