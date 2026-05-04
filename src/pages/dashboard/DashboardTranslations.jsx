import { useState, useEffect, useMemo } from 'react'
import { Search, Save, Check, Globe, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi } from '../../hooks/useApi'
import i18n from '../../i18n'

// Marker prefix for non-string values (arrays/objects) that we preserve through the
// flatten/edit/unflatten round-trip. The editor displays JSON for these values; on save,
// unflatten parses them back to real arrays/objects. Without this, lodash.merge mangles
// nested arrays into objects with numeric keys.
const RAW_PREFIX = '__JSON__:'

function flatten(obj, prefix = '', out = {}) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (Array.isArray(v)) {
      // Preserve arrays as a marked JSON string — editor can show the raw text;
      // unflatten() converts it back to an array on save.
      out[path] = RAW_PREFIX + JSON.stringify(v)
    } else if (v && typeof v === 'object') {
      flatten(v, path, out)
    } else if (v == null) {
      out[path] = ''
    } else {
      out[path] = typeof v === 'string' ? v : String(v)
    }
  }
  return out
}

function unflatten(flat) {
  const out = {}
  for (const [path, raw] of Object.entries(flat)) {
    let value = raw
    if (typeof raw === 'string' && raw.startsWith(RAW_PREFIX)) {
      try { value = JSON.parse(raw.slice(RAW_PREFIX.length)) } catch { value = raw }
    }
    const parts = path.split('.')
    let node = out
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== 'object' || Array.isArray(node[parts[i]])) {
        node[parts[i]] = {}
      }
      node = node[parts[i]]
    }
    node[parts[parts.length - 1]] = value
  }
  return out
}

// Heals legacy data where flatten() previously JSON-stringified arrays/objects into
// raw strings. Walks the live tree and parses any string shaped like "[...]" / "{...}".
// Runs on read so the dashboard sees real arrays — saves them back via the new flatten
// (with __JSON__: marker), permanently un-corrupting the DB on the next save.
function deepRepair(node) {
  if (Array.isArray(node)) return node.map(deepRepair)
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = deepRepair(v)
    return out
  }
  if (typeof node === 'string') {
    const t = node.trim()
    if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
      try {
        const parsed = JSON.parse(t)
        if (parsed && (Array.isArray(parsed) || typeof parsed === 'object')) {
          return deepRepair(parsed)
        }
      } catch { /* not JSON */ }
    }
  }
  return node
}

export default function DashboardTranslations() {
  const { data: enData, refetch: refetchEn, error: enError } = useApi('/api/translations/en')
  const { data: arData, refetch: refetchAr, error: arError } = useApi('/api/translations/ar')

  const [enFlat, setEnFlat] = useState({})
  const [arFlat, setArFlat] = useState({})
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => { if (enData?.keys) setEnFlat(flatten(deepRepair(enData.keys))) }, [enData])
  useEffect(() => { if (arData?.keys) setArFlat(flatten(deepRepair(arData.keys))) }, [arData])

  const allKeys = useMemo(() => {
    const set = new Set([...Object.keys(enFlat), ...Object.keys(arFlat)])
    return [...set].sort()
  }, [enFlat, arFlat])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allKeys
    return allKeys.filter((k) =>
      k.toLowerCase().includes(q) ||
      (enFlat[k] || '').toLowerCase().includes(q) ||
      (arFlat[k] || '').includes(search.trim())
    )
  }, [allKeys, search, enFlat, arFlat])

  function updateEn(key, value) { setEnFlat((prev) => ({ ...prev, [key]: value })) }
  function updateAr(key, value) { setArFlat((prev) => ({ ...prev, [key]: value })) }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await api.put('/api/translations/en', { keys: unflatten(enFlat) })
      await api.put('/api/translations/ar', { keys: unflatten(arFlat) })
      await Promise.all([refetchEn(), refetchAr()])
      // Flush i18next's bundled cache so the public site shows the new strings on next render
      if (typeof i18n.reloadFromBackend === 'function') await i18n.reloadFromBackend()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err?.body?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  const fetchError = enError || arError
  const noData = !enData && !arData

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Translations</h1>
        <p className="text-sm text-slate-400 mt-0.5">Edit EN / AR strings for the public website. Saved changes go live on next page load.</p>
      </div>

      {fetchError && noData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <Globe size={15} className="inline mr-1.5" />
          Translations not yet seeded. Run <code className="px-1 rounded bg-amber-100">npm run seed</code> in the backend, or save here to bootstrap them.
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keys or text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navara-blue/30"
            />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {allKeys.length} keys</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              saved ? 'bg-emerald-500 text-white' : 'bg-navara-blue text-white hover:bg-blue-800'
            }`}
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save All</>}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Key</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">English</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Arabic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-400">No keys match.</td>
                </tr>
              )}
              {filtered.map((key) => (
                <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 align-top">
                    <code className="text-xs text-navara-blue bg-blue-50 px-1.5 py-0.5 rounded break-all">{key}</code>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <input
                      value={enFlat[key] || ''}
                      onChange={(e) => updateEn(key, e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 focus:border-navara-blue py-0.5 text-sm text-slate-700 focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="px-5 py-3 align-top">
                    <input
                      dir="rtl"
                      value={arFlat[key] || ''}
                      onChange={(e) => updateAr(key, e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 focus:border-navara-blue py-0.5 text-sm text-slate-700 focus:outline-none transition-colors text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
