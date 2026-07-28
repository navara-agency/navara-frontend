/**
 * Single source of truth for the site's language-aware URL shape.
 *
 * Arabic is the default language and lives at the root. English is prefixed.
 *
 *   /            /about        /services       ...  -> Arabic
 *   /en          /en/about     /en/services    ...  -> English
 *
 * The root belongs to Arabic because SA/EG is the primary market and the
 * Arabic pages are the ones that should carry the site's authority long-term.
 *
 * Known cost of this shape: the English pages were previously at the root and
 * are already indexed (the site ranks #1 for "navara agency"). Moving them to
 * /en means they re-index as new URLs and English rankings will move, and
 * probably dip, for a few weeks. Accepted deliberately — do not "fix" this by
 * redirecting /about to /en/about, which would put English back at the root
 * and undo the whole change.
 */

export const ORIGIN = 'https://navaraagency.com'

/** The language served from the root, i.e. with no prefix. */
export const DEFAULT_LANG = 'ar'
/** The language served from a URL prefix. */
export const PREFIXED_LANG = 'en'
export const VALID_LANGS = ['en', 'ar']

/**
 * Public route slugs without a language prefix. '' is the home page.
 * App.jsx renders each of these twice (bare + /en), so adding a public page
 * means adding it here and to PUBLIC_ROUTES in App.jsx — nowhere else.
 */
export const PUBLIC_SLUGS = ['', 'about', 'services', 'industries', 'how-we-work', 'contact']

/** True for any path served by the dashboard SPA rather than the public site. */
export function isDashboardPath(pathname = '/') {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
}

/**
 * The language a given path serves. The URL is the ONLY source of truth —
 * deriving it from localStorage (as this app used to) means one URL returns
 * different content per visitor, which is precisely why the Arabic content
 * was never indexable.
 */
export function langFromPath(pathname = '/') {
  return pathname === '/en' || pathname.startsWith('/en/') ? PREFIXED_LANG : DEFAULT_LANG
}

/** Remove the /en prefix, returning the canonical Arabic path. */
export function stripLang(pathname = '/') {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname || '/'
}

/** Render `pathname` in `lang`. Accepts already-prefixed or bare input. */
export function localizedPath(pathname = '/', lang = DEFAULT_LANG) {
  const base = stripLang(pathname)
  if (lang !== PREFIXED_LANG) return base
  return base === '/' ? '/en' : `/en${base}`
}

/** The same page in the other language — powers the navbar switcher + hreflang. */
export function counterpartPath(pathname = '/') {
  return langFromPath(pathname) === PREFIXED_LANG
    ? stripLang(pathname)
    : localizedPath(pathname, PREFIXED_LANG)
}

/** True if the path maps to a known public marketing page in either language. */
export function isPublicPath(pathname = '/') {
  const slug = stripLang(pathname).replace(/^\//, '').replace(/\/$/, '')
  return PUBLIC_SLUGS.includes(slug)
}
