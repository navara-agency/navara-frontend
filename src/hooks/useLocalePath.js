import { useLocation } from 'react-router-dom'
import { localeFromPath, toPath } from '../lib/locale'

/**
 * Locale-aware in-app links.
 *
 * Absolute paths like '/contact' are wrong now that Arabic lives at the root
 * and English under /en — an English visitor clicking one lands on the Arabic
 * page, which loses the language and breaks the crawlable /en tree. Every
 * internal link and programmatic navigation should go through `path()`.
 *
 *   const { path } = useLocalePath()
 *   navigate(path('contact', '#contact-form'))  // '/en/contact#contact-form'
 */
export default function useLocalePath() {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)

  return {
    locale,
    path: (route = '', hash = '') => toPath(locale, route) + (hash || ''),
  }
}
