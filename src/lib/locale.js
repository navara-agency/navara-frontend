// Locale <-> URL helpers.
//
// Arabic is the default and lives at the root (`/services`).
// English is prefixed (`/en/services`).
//
// Keeping the locale in the URL rather than in localStorage is what makes the
// Arabic site indexable at all — a crawler has no way to "click" a language
// toggle, so a storage-based locale is invisible to search engines.

export const LOCALES = ['ar', 'en']
export const DEFAULT_LOCALE = 'ar'
export const PREFIXED_LOCALE = 'en'

/** Read the active locale out of a pathname. */
export function localeFromPath(pathname = '/') {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ar'
}

/** Remove the `/en` prefix, returning the locale-neutral path. */
export function stripLocale(pathname = '/') {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname || '/'
}

/**
 * Add the correct prefix for `locale` to a locale-neutral path.
 * Preserves a trailing `#hash` (nav links use `/#faq`).
 */
export function withLocale(path = '/', locale = DEFAULT_LOCALE) {
  const [rawPath, hash = ''] = String(path).split('#')
  const base = rawPath || '/'
  const clean = base.startsWith('/') ? base : `/${base}`
  const prefixed =
    locale === PREFIXED_LOCALE ? (clean === '/' ? '/en' : `/en${clean}`) : clean
  return hash ? `${prefixed}#${hash}` : prefixed
}

/** Absolute URL for a locale-neutral path in a given locale. */
export function absoluteUrl(path = '/', locale = DEFAULT_LOCALE, origin = 'https://navaraagency.com') {
  return `${origin}${withLocale(path, locale)}`
}
