/**
 * Single source of truth for the site's language-aware URL shape.
 *
 * English stays at the root; Arabic is prefixed with /ar.
 *
 *   /            /about        /services       ...  -> English
 *   /ar          /ar/about     /ar/services    ...  -> Arabic
 *
 * The root was NOT given to Arabic, even though SA/EG is the primary market and
 * root URLs carry more weight. Every English page is already indexed and the
 * site ranks #1 for "navara agency"; handing the root to Arabic would change
 * what those indexed URLs serve and strand the English pages on new URLs with
 * no accumulated authority. /ar is purely additive — nothing that currently
 * ranks moves or changes language. Revisit once /ar has authority of its own.
 */

export const ORIGIN = 'https://navaraagency.com'

/** The language served from the root, i.e. with no prefix. */
export const DEFAULT_LANG = 'en'
/** The language served from a URL prefix. */
export const PREFIXED_LANG = 'ar'
export const VALID_LANGS = ['en', 'ar']

/**
 * Public route slugs without a language prefix. '' is the home page.
 * App.jsx renders each of these twice (bare + /ar), so adding a public page
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
  return pathname === '/ar' || pathname.startsWith('/ar/') ? PREFIXED_LANG : DEFAULT_LANG
}

/** Remove the /ar prefix, returning the English path. */
export function stripLang(pathname = '/') {
  if (pathname === '/ar') return '/'
  if (pathname.startsWith('/ar/')) return pathname.slice(3) || '/'
  return pathname || '/'
}

/** Render `pathname` in `lang`. Accepts already-prefixed or bare input. */
export function localizedPath(pathname = '/', lang = DEFAULT_LANG) {
  const base = stripLang(pathname)
  if (lang !== PREFIXED_LANG) return base
  return base === '/' ? '/ar' : `/ar${base}`
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
