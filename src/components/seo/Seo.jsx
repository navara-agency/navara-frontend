import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import {
  SITE_URL,
  localeFromPath,
  routeFromPath,
  canonicalUrl,
  alternates,
  isRtl,
} from '../../lib/locale'
import { metaFor } from '../../config/seo'

const OG_IMAGE = `${SITE_URL}/og-image.png`

/**
 * Single place that emits a page's search metadata.
 *
 * Every public page renders exactly one <Seo />. Deriving locale and route from
 * the URL (rather than from i18n state) means the tags are correct at first
 * paint, which is what the build-time prerenderer captures.
 */
export default function Seo({ title, description, image = OG_IMAGE, schema = null, noindex = false }) {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  const route = routeFromPath(pathname)

  const fallback = metaFor(locale, route)
  const pageTitle = title ?? fallback.title
  const pageDescription = description ?? fallback.description
  const canonical = canonicalUrl(locale, route)

  return (
    <Helmet>
      {/* Drives the prerendered <html lang>/<dir>, which Google uses as a
          language signal alongside hreflang. */}
      <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} />

      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {alternates(route).map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Navara" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={locale === 'ar' ? 'ar_EG' : 'en_US'} />
      <meta property="og:locale:alternate" content={locale === 'ar' ? 'en_US' : 'ar_EG'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />

      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  )
}
