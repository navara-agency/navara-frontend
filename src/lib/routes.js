/**
 * Single source of truth for the site's language-aware URL shape.
 *
 * Arabic is canonical and lives at the root; English is prefixed with /en.
 * That split is deliberate: the audience is Saudi Arabia and Egypt, so the
 * Arabic pages get the shorter, higher-authority URLs and x-default.
 *
 *   /            /about        /services       ...  -> Arabic
 *   /en          /en/about     /en/services    ...  -> English
 */

export const ORIGIN = 'https://navaraagency.com'

export const DEFAULT_LANG = 'ar'
export const VALID_LANGS = ['en', 'ar']

/**
 * Public route slugs without a language prefix. '' is the home page.
 * App.jsx renders each of these twice (bare + /en), so adding a public page
 * means adding it here and in App.jsx's PUBLIC_ROUTES — nowhere else.
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
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LANG
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
  if (lang !== 'en') return base
  return base === '/' ? '/en' : `/en${base}`
}

/** The same page in the other language — powers the navbar switcher + hreflang. */
export function counterpartPath(pathname = '/') {
  return langFromPath(pathname) === 'en'
    ? stripLang(pathname)
    : localizedPath(pathname, 'en')
}

/** True if the path maps to a known public marketing page in either language. */
export function isPublicPath(pathname = '/') {
  const slug = stripLang(pathname).replace(/^\//, '').replace(/\/$/, '')
  return PUBLIC_SLUGS.includes(slug)
}
