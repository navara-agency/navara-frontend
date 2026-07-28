// Locale <-> URL mapping.
//
// Arabic is the primary market language (Egypt + KSA) so it is served from the
// domain root and inherits the root's authority. English is namespaced under
// /en. Every locale-aware part of the app derives from these helpers rather
// than hard-coding prefixes, so the scheme can be changed in one place.

export const SITE_URL = 'https://navaraagency.com'

export const DEFAULT_LOCALE = 'ar'
export const LOCALES = ['ar', 'en']

// Route slugs shared by both locales. '' is the home page.
export const ROUTES = ['', 'about', 'services', 'industries', 'how-we-work', 'contact']

function segments(pathname = '/') {
  return pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
}

/** Locale implied by a pathname. Anything not under /en is Arabic. */
export function localeFromPath(pathname = '/') {
  return segments(pathname)[0] === 'en' ? 'en' : DEFAULT_LOCALE
}

/** Route slug for a pathname, with any locale prefix removed. '/en/services' -> 'services' */
export function routeFromPath(pathname = '/') {
  const parts = segments(pathname)
  if (parts[0] === 'en') parts.shift()
  return parts.join('/')
}

/** Build an in-app path. toPath('en', 'services') -> '/en/services' */
export function toPath(locale, route = '') {
  const clean = String(route).replace(/^\/+|\/+$/g, '')
  const base = locale === 'en' ? '/en' : ''
  if (!clean) return base || '/'
  return `${base}/${clean}`
}

/** Absolute URL for a locale + route. */
export function canonicalUrl(locale, route = '') {
  return SITE_URL + toPath(locale, route)
}

/**
 * Reciprocal hreflang set for a route. x-default points at Arabic because that
 * is the primary audience; Google falls back to it for unmatched locales.
 */
export function alternates(route = '') {
  return [
    { hrefLang: 'ar', href: canonicalUrl('ar', route) },
    { hrefLang: 'en', href: canonicalUrl('en', route) },
    { hrefLang: 'x-default', href: canonicalUrl('ar', route) },
  ]
}

/**
 * Same page, other language. Used by the navbar language toggle so switching
 * language is a real navigation (and therefore a crawlable, linkable state)
 * instead of a hidden localStorage write.
 */
export function swapLocalePath(pathname = '/', hash = '') {
  const current = localeFromPath(pathname)
  const next = current === 'ar' ? 'en' : 'ar'
  return toPath(next, routeFromPath(pathname)) + (hash || '')
}

export function isRtl(locale) {
  return locale === 'ar'
}
