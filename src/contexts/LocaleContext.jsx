import { createContext, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE, LOCALES, stripLocale } from '../config/locales'

const LocaleContext = createContext(null)

/**
 * Makes the URL the single source of truth for language.
 *
 * Previously i18n read localStorage at startup and fell back to `en`. Crawlers
 * never have localStorage, so every Googlebot visit rendered English and the
 * Arabic site was effectively invisible. The locale now comes from the path
 * segment and this provider keeps i18next, <html lang> and <html dir> in sync
 * with it.
 */
export function LocaleProvider({ locale = DEFAULT_LOCALE, prefixed = false, children }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale, i18n])

  const value = useMemo(() => ({
    locale,
    prefixed,
    isRTL: locale === 'ar',

    /**
     * Switch locale by navigating to the same page under the other prefix.
     *
     * This is a full document load rather than a client-side transition, and
     * deliberately so: the router basename is fixed at mount, so changing the
     * prefix requires a remount. The full load also means the visitor gets the
     * prerendered HTML for the target locale.
     */
    switchTo(next) {
      if (!LOCALES.includes(next) || next === locale) return
      const { pathname, search, hash } = window.location
      window.location.assign(`/${next}${stripLocale(pathname)}${search}${hash}`)
    },
  }), [locale, prefixed])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale() must be called inside <LocaleProvider>')
  }
  return ctx
}
