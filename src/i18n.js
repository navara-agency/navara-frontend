import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'
import { DEFAULT_LOCALE, localeFromPath } from './lib/locale'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Language is derived from the URL, not from storage.
//
// Previously the active language was persisted in localStorage, which meant one
// URL could render either language depending on the visitor. Search engines only
// ever saw the default, so the Arabic site had no addressable URL and could not
// be indexed at all. Arabic now lives at the root and English under /en, and
// this reads whichever the current path implies.
function initialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  return localeFromPath(window.location.pathname)
}

// Initialise with bundled JSON for instant render. Then asynchronously fetch the live
// translations from /api/translations/:lang and overwrite the bundles, so dashboard edits
// take effect on the next hard-refresh of the public site.
//
// We don't use i18next-http-backend's auto-fetch flow because it skips namespaces that
// are already registered via the `resources` option — which means it would never actually
// hit our API in this configuration.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLanguage(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

// Repair leftover JSON-stringified arrays/objects from earlier saves where flatten()
// turned arrays into strings. Strings shaped like "[...]" or "{...}" that parse cleanly
// are restored to their original structure so consumers calling t(key, { returnObjects: true })
// still get arrays back.
function deepRepair(node) {
  if (Array.isArray(node)) return node.map(deepRepair)
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = deepRepair(v)
    return out
  }
  if (typeof node === 'string') {
    const trimmed = node.trim()
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && (Array.isArray(parsed) || typeof parsed === 'object')) {
          return deepRepair(parsed)
        }
      } catch { /* not JSON, fall through */ }
    }
  }
  return node
}

async function loadLiveTranslations() {
  let touched = false
  for (const lang of ['en', 'ar']) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/translations/${lang}`, { cache: 'no-store' })
      if (!res.ok) continue
      const data = await res.json()
      if (data && data.keys && typeof data.keys === 'object' && !Array.isArray(data.keys)) {
        const repaired = deepRepair(data.keys)
        // overwrite=true and deep=true so live values win over bundled ones
        i18n.addResourceBundle(lang, 'translation', repaired, true, true)
        touched = true
      }
    } catch {
      // network/CORS — silently keep bundled fallback
    }
  }
  // Force components using useTranslation() to re-render with the new bundles.
  // changeLanguage() to the *same* language is the documented way to do this in i18next.
  if (touched) {
    try { await i18n.changeLanguage(i18n.language) } catch { /* ignore */ }
  }
}

// Defer live translation fetch until the browser is idle so it doesn't compete
// with critical resources on initial load. Falls back to a 3 s timeout on browsers
// that don't support requestIdleCallback (e.g. older Safari).
if (typeof window !== 'undefined') {
  const run = () => loadLiveTranslations().catch(() => { /* ignore */ })
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 3000 })
  } else {
    setTimeout(run, 3000)
  }
}

// Expose a manual reload hook so the dashboard's translation save can flush the cache
// without forcing a full page reload (we still recommend hard-refresh in dev for clarity).
i18n.reloadFromBackend = loadLiveTranslations

export default i18n
