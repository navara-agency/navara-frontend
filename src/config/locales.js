// Single source of truth for locale routing, shared by the React app and the
// build-time scripts (scripts/prerender.mjs, scripts/generate-sitemap.mjs).
// Keep this file dependency-free so plain Node can import it.

export const SITE_URL = 'https://navaraagency.com'

export const LOCALES = ['ar', 'en']

// Arabic is the primary market (Egypt + KSA). `/` serves Arabic, and x-default
// points at the Arabic tree.
export const DEFAULT_LOCALE = 'ar'

// hreflang values emitted per locale. Arabic gets the bare `ar` plus both
// regional variants so Google can match Egyptian and Saudi searchers to the
// same URL without us maintaining separate country trees.
export const HREFLANG = {
  ar: ['ar', 'ar-EG', 'ar-SA'],
  en: ['en'],
}

// Every public marketing route. Dashboard routes are deliberately excluded —
// they are not localized, not prerendered and not in the sitemap.
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/industries',
  '/how-we-work',
  '/contact',
]

// Relative sitemap priority per route. Home leads, contact trails.
export const ROUTE_PRIORITY = {
  '/': '1.0',
  '/services': '0.9',
  '/about': '0.8',
  '/industries': '0.8',
  '/how-we-work': '0.8',
  '/contact': '0.7',
}

/**
 * Work out which locale a pathname belongs to.
 *
 * Returns the router `basename` as well, which is how the prefix is applied:
 * mounting <BrowserRouter basename="/en"> makes every existing `<Link to="/about">`
 * and `navigate('/contact')` resolve to `/en/about` and `/en/contact` without
 * touching a single call site.
 *
 * Unprefixed paths (`/`, `/services`, and the `/dashboard/*` tree) keep an empty
 * basename and render the default locale, so no existing URL breaks.
 */
export function detectLocale(pathname = '/') {
  const segment = pathname.split('/')[1]

  if (LOCALES.includes(segment)) {
    return { locale: segment, basename: `/${segment}`, prefixed: true }
  }

  return { locale: DEFAULT_LOCALE, basename: '', prefixed: false }
}

/** Strip a leading `/ar` or `/en` from a pathname. Always returns a leading slash. */
export function stripLocale(pathname = '/') {
  const { basename } = detectLocale(pathname)
  if (!basename) return pathname || '/'
  return pathname.slice(basename.length) || '/'
}

/** Absolute URL for a route in a given locale, e.g. ('en', '/about') -> https://…/en/about */
export function absoluteUrl(locale, route) {
  const path = route === '/' ? '/' : route
  return `${SITE_URL}/${locale}${path === '/' ? '/' : path}`
}
