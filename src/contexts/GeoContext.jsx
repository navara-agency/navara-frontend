import { createContext, useContext, useEffect, useState } from 'react'
import { api, API_BASE_URL } from '../lib/api'

const GeoContext = createContext({ market: 'Egypt', config: null, loading: true, debug: null })

const isProd = import.meta.env.PROD

// Dev-only: ask one of several public-IP services for the browser's public IP so /api/geo on
// localhost can resolve the *visitor's* country (i.e. honor a VPN). Some VPNs/firewalls block
// individual providers — try a few in order and use the first one that responds.
// Only providers that send permissive CORS headers — my-ip.io / others without
// access-control-allow-origin would log a noisy CORS error in the console even though
// we'd silently catch and try the next provider.
const IP_PROVIDERS = [
  { name: 'ipify',    url: 'https://api.ipify.org?format=json',  pick: (d) => d?.ip },
  { name: 'ipapi.co', url: 'https://ipapi.co/json/',             pick: (d) => d?.ip },
  { name: 'cloudflare-trace', url: 'https://www.cloudflare.com/cdn-cgi/trace', pick: (raw) => {
      const m = String(raw).match(/^ip=(.+)$/m)
      return m ? m[1] : null
    },
    text: true,
  },
]

// Race all providers in parallel — first one to return a valid IP wins. Cuts the worst-case
// wait from ~10s sequential to ~2.5s parallel.
function fetchPublicIp() {
  return new Promise((resolve) => {
    let settled = false
    let pending = IP_PROVIDERS.length
    const finish = (result) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    IP_PROVIDERS.forEach((p) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      fetch(p.url, { cache: 'no-store', signal: controller.signal })
        .then(async (res) => {
          clearTimeout(timer)
          if (!res.ok) throw new Error(`status ${res.status}`)
          const data = p.text ? await res.text() : await res.json()
          const ip = p.pick(data)
          if (typeof ip === 'string' && ip.trim()) {
            finish({ ip: ip.trim(), provider: p.name })
          } else {
            throw new Error('no ip in response')
          }
        })
        .catch(() => { /* try next */ })
        .finally(() => {
          pending -= 1
          if (pending === 0 && !settled) finish({ ip: null, provider: null })
        })
    })
  })
}

const GEO_CACHE_KEY = 'navara_geo_v1'
function readCache() {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function writeCache(value) {
  try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(value)) } catch { /* quota */ }
}
function clearCache() {
  try { sessionStorage.removeItem(GEO_CACHE_KEY) } catch { /* no-op */ }
}

function readUrlOverride() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const override = params.get('geo')
  if (override && ['Egypt', 'KSA'].includes(override)) return override
  return null
}

export function GeoProvider({ children }) {
  const [state, setState] = useState({ market: 'Egypt', config: null, loading: true, debug: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const params = new URLSearchParams()
      let clientDebug = {}

      // 0. Session cache: if we already resolved geo for this tab, render instantly.
      //    Only used when there's no URL override (so ?geo=... still re-resolves explicitly).
      const forcedBefore = readUrlOverride()
      const wantsRefresh = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('geo-refresh')
      if (!forcedBefore && !wantsRefresh) {
        const cached = readCache()
        if (cached && cached.market && cached.config) {
          if (!cancelled) setState({ ...cached, loading: false })
          return
        }
      }

      // 1. Hard URL override wins (QA without a VPN: ?geo=KSA)
      const forced = readUrlOverride()
      if (forced) {
        params.set('market', forced)
        clientDebug.source = 'url-override'
      } else if (!isProd) {
        // 2. Dev-only: enrich with the visitor's real public IP so VPNs change the result.
        //    Production talks to /api/geo directly — Hostinger's reverse proxy passes
        //    the real X-Forwarded-For so req.ip is already correct there.
        const { ip, provider } = await fetchPublicIp()
        clientDebug.detectedIp = ip
        clientDebug.ipProvider = provider
        if (ip) params.set('ip', ip)
        else clientDebug.source = 'no-ip-provider-reachable'
      }

      // In dev, force a cache-bypass so VPN changes are seen immediately
      if (!isProd) params.set('nocache', '1')

      try {
        const qs = params.toString()
        const path = qs ? `/api/geo?${qs}` : '/api/geo'
        const res = await api.get(path)
        const merged = {
          market: res.market,
          config: res.config,
          loading: false,
          debug: { ...clientDebug, ...(res.debug || {}) },
        }
        if (!cancelled) setState(merged)
        // Persist for the rest of the tab's session
        writeCache({ market: merged.market, config: merged.config, debug: merged.debug })
      } catch (err) {
        if (!cancelled) setState({
          market: 'Egypt',
          config: null,
          loading: false,
          debug: { ...clientDebug, reason: err?.message || 'fetch failed' },
        })
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return <GeoContext.Provider value={state}>{children}</GeoContext.Provider>
}

export function useGeo() {
  return useContext(GeoContext)
}

// Lets dev tools wipe the per-tab cache (e.g., from the GeoDevBadge)
export function clearGeoCache() { clearCache() }

// Exposed for debugging / docs
export { API_BASE_URL }
