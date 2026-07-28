import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'
import { DEFAULT_LOCALE, VALID_LANGS_HINT } from './config/locales'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const LANG_KEY = 'navara_lang'
const VALID_LANGS = ['en', 'ar']

// NOTE: startup language is NOT read from localStorage any more.
//
// It used to be, with an `en` fallback — which meant every visitor without a
// stored preference was served English. Crawlers never have localStorage, so
// Google only ever saw the English site and the Arabic pages could not be
// indexed at all.
//
// The URL is now the source of truth (see src/config/locales.js and
// LocaleProvider). We initialise with the default locale and LocaleProvider
// immediately reconciles it with the path on mount.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

// Still recorded, purely so we can offer a "you were last reading in X" hint
// later if we want one. It no longer decides what gets rendered.
i18n.on('languageChanged', (lng) => {
  if (typeof window === 'undefined') return
  if (!VALID_LANGS.includes(lng)) return
  try { window.localStorage.setItem(LANG_KEY, lng) } catch { /* quota / blocked storage */ }
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
//
// Skipped during prerendering: the build-time crawl should serialise the bundled
// translations deterministically rather than whatever the API happens to return.
if (typeof window !== 'undefined' && !window.__PRERENDER__) {
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
