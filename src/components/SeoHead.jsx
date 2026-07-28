import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { ORIGIN, langFromPath, stripLang, localizedPath } from '../lib/routes'

/**
 * Emits the language-dependent head tags for the current route: canonical and
 * the reciprocal hreflang set.
 *
 * Deliberately does NOT emit <title> or <meta name="description"> — each page
 * still owns those through its own Helmet block. This component only manages
 * the tags that depend on the URL's language, so it can be mounted once in
 * PublicSite instead of being threaded through all six pages.
 *
 * Mounted AFTER <AnimatedRoutes> in the tree on purpose. react-helmet-async
 * resolves duplicate tags in mount order, last one wins, and the page
 * components currently hardcode `<link rel="canonical" href=".../" />` — the
 * same value on every route. Rendering later means the correct per-route
 * canonical overrides those stale ones without editing six files.
 *
 * Follow-up: delete the hardcoded canonical from each page in src/pages/ and
 * this ordering dependency stops mattering.
 */
export default function SeoHead() {
  const { pathname } = useLocation()
  const lang = langFromPath(pathname)

  const arPath = stripLang(pathname)
  const enPath = localizedPath(pathname, 'en')
  const canonical = ORIGIN + (lang === 'en' ? enPath : arPath)

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <link rel="canonical" href={canonical} />

      {/* Reciprocal and absolute, which Google requires — an hreflang cluster
          whose members don't all point back at each other is ignored.
          x-default is Arabic: it is the site's default language and the root. */}
      <link rel="alternate" hrefLang="ar" href={ORIGIN + arPath} />
      <link rel="alternate" hrefLang="en" href={ORIGIN + enPath} />
      <link rel="alternate" hrefLang="x-default" href={ORIGIN + arPath} />

      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_SA' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'ar' ? 'en_US' : 'ar_SA'} />
    </Helmet>
  )
}
