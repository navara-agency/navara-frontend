import { useState, useEffect } from 'react'
import { Save, Check, Loader2, AlertCircle, Power, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

const INPUT = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

const DEFAULT_TRUST_CARD = {
  enabled: true,
  pillLabel: 'Navara Growth',
  metric: '+30%',
  metricCaption: 'avg. revenue increase',
  metricSubcaption: 'within first 90 days',
  stats: [
    { label: 'Clients', value: '50+' },
    { label: 'Countries', value: '3' },
    { label: 'Avg. ROAS', value: '4.2×' },
  ],
}

const EMPTY = {
  global: { linkedinUrl: '', instagramUrl: '', emailContact: '', metaTitle: '', metaDescription: '' },
  eg:  { phone: '', whatsapp: '', office: '', hours: '', ctaSubtext: '', calLink: '' },
  ksa: { phone: '', whatsapp: '', office: '', hours: '', ctaSubtext: '', calLink: '' },
  trustCard: DEFAULT_TRUST_CARD,
}

export default function DashboardSiteConfig() {
  const { data, loading, error, refetch } = useApi('/api/site-config/admin', { auth: true })
  const [config, setConfig] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (data) {
      setConfig({
        global: { ...EMPTY.global, ...(data.global || {}) },
        eg:     { ...EMPTY.eg,     ...(data.eg     || {}) },
        ksa:    { ...EMPTY.ksa,    ...(data.ksa    || {}) },
        trustCard: {
          ...DEFAULT_TRUST_CARD,
          ...(data.trustCard || {}),
          stats: Array.isArray(data.trustCard?.stats) && data.trustCard.stats.length
            ? data.trustCard.stats
            : DEFAULT_TRUST_CARD.stats,
        },
      })
    }
  }, [data])

  function setGlobal(k, v) { setConfig((c) => ({ ...c, global: { ...c.global, [k]: v } })) }
  function setEg(k, v)     { setConfig((c) => ({ ...c, eg:     { ...c.eg,     [k]: v } })) }
  function setKsa(k, v)    { setConfig((c) => ({ ...c, ksa:    { ...c.ksa,    [k]: v } })) }
  function setTrust(k, v)  { setConfig((c) => ({ ...c, trustCard: { ...c.trustCard, [k]: v } })) }
  function setTrustStat(idx, k, v) {
    setConfig((c) => ({
      ...c,
      trustCard: {
        ...c.trustCard,
        stats: c.trustCard.stats.map((s, i) => (i === idx ? { ...s, [k]: v } : s)),
      },
    }))
  }
  function addTrustStat() {
    setConfig((c) => ({
      ...c,
      trustCard: { ...c.trustCard, stats: [...(c.trustCard.stats || []), { label: 'New', value: '' }] },
    }))
  }
  function removeTrustStat(idx) {
    setConfig((c) => ({
      ...c,
      trustCard: { ...c.trustCard, stats: c.trustCard.stats.filter((_, i) => i !== idx) },
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await api.put('/api/site-config', config)
      await refetch()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err?.body?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !data) {
    return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading site config…</div>
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Site Configuration</h1>
        <p className="text-sm text-slate-400 mt-0.5">Live operational details — phone, links, hours. Changes publish to the website on next page load.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error.message || 'Failed to load config'}
        </div>
      )}

      <Section title="Global — Contact & Links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="LinkedIn URL"><input className={INPUT} value={config.global.linkedinUrl || ''} onChange={(e) => setGlobal('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/company/navara" /></Field>
          <Field label="Instagram URL"><input className={INPUT} value={config.global.instagramUrl || ''} onChange={(e) => setGlobal('instagramUrl', e.target.value)} placeholder="https://instagram.com/navara" /></Field>
          <Field label="Contact Email"><input className={INPUT} type="email" value={config.global.emailContact || ''} onChange={(e) => setGlobal('emailContact', e.target.value)} placeholder="hello@navara.com" /></Field>
        </div>
      </Section>

      <Section title="Egypt Market">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone"><input className={INPUT} value={config.eg.phone || ''} onChange={(e) => setEg('phone', e.target.value)} placeholder="+20 100 000 0000" /></Field>
          <Field label="WhatsApp"><input className={INPUT} value={config.eg.whatsapp || ''} onChange={(e) => setEg('whatsapp', e.target.value)} placeholder="+20 100 000 0000" /></Field>
          <Field label="Office"><input className={INPUT} value={config.eg.office || ''} onChange={(e) => setEg('office', e.target.value)} placeholder="Cairo, Egypt" /></Field>
          <Field label="Hours"><input className={INPUT} value={config.eg.hours || ''} onChange={(e) => setEg('hours', e.target.value)} placeholder="Sun–Thu, 9am–6pm EET" /></Field>
          <Field label="CTA Subtext"><input className={INPUT} value={config.eg.ctaSubtext || ''} onChange={(e) => setEg('ctaSubtext', e.target.value)} placeholder="Serving Egypt" /></Field>
          <Field label="Cal.com Path" hint='e.g. "omarelsady/discovery-call-eg"'><input className={INPUT} value={config.eg.calLink || ''} onChange={(e) => setEg('calLink', e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="KSA Market">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone"><input className={INPUT} value={config.ksa.phone || ''} onChange={(e) => setKsa('phone', e.target.value)} placeholder="+966 50 000 0000" /></Field>
          <Field label="WhatsApp"><input className={INPUT} value={config.ksa.whatsapp || ''} onChange={(e) => setKsa('whatsapp', e.target.value)} placeholder="+966 50 000 0000" /></Field>
          <Field label="Office"><input className={INPUT} value={config.ksa.office || ''} onChange={(e) => setKsa('office', e.target.value)} placeholder="Riyadh, KSA" /></Field>
          <Field label="Hours"><input className={INPUT} value={config.ksa.hours || ''} onChange={(e) => setKsa('hours', e.target.value)} placeholder="Sun–Thu, 9am–6pm AST" /></Field>
          <Field label="CTA Subtext"><input className={INPUT} value={config.ksa.ctaSubtext || ''} onChange={(e) => setKsa('ctaSubtext', e.target.value)} placeholder="Serving KSA" /></Field>
          <Field label="Cal.com Path"><input className={INPUT} value={config.ksa.calLink || ''} onChange={(e) => setKsa('calLink', e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Homepage Trust Card">
        <div className="flex items-center justify-between -mt-1 mb-1">
          <p className="text-xs text-slate-500 max-w-md">
            The floating "Navara Growth" card on the homepage. Edit the pill label, big metric, captions,
            and the bottom stats row. Toggle off to hide it entirely.
          </p>
          <button
            type="button"
            onClick={() => setTrust('enabled', !config.trustCard.enabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
              config.trustCard.enabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Power size={12} /> {config.trustCard.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Pill Label" hint="Small badge at the top of the card.">
            <input className={INPUT} value={config.trustCard.pillLabel || ''} onChange={(e) => setTrust('pillLabel', e.target.value)} placeholder="Navara Growth" />
          </Field>
          <Field label="Big Metric" hint="Center number (e.g. '+30%', '2x', '90 days').">
            <input className={INPUT} value={config.trustCard.metric || ''} onChange={(e) => setTrust('metric', e.target.value)} placeholder="+30%" />
          </Field>
          <Field label="Metric Caption" hint="Line directly under the metric.">
            <input className={INPUT} value={config.trustCard.metricCaption || ''} onChange={(e) => setTrust('metricCaption', e.target.value)} placeholder="avg. revenue increase" />
          </Field>
          <Field label="Metric Sub-caption" hint="Smaller line below the caption.">
            <input className={INPUT} value={config.trustCard.metricSubcaption || ''} onChange={(e) => setTrust('metricSubcaption', e.target.value)} placeholder="within first 90 days" />
          </Field>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Bottom Stats</label>
              <p className="text-[11px] text-slate-400 mt-0.5">Up to 4 stats render in the card; 3 is the visual sweet spot.</p>
            </div>
            <button
              type="button"
              onClick={addTrustStat}
              disabled={(config.trustCard.stats || []).length >= 6}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Plus size={11} /> Add stat
            </button>
          </div>
          <div className="space-y-2">
            {(config.trustCard.stats || []).map((s, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <input
                  className={INPUT}
                  value={s.label || ''}
                  onChange={(e) => setTrustStat(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Countries)"
                />
                <input
                  className={INPUT}
                  value={s.value || ''}
                  onChange={(e) => setTrustStat(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. 3)"
                />
                <button
                  type="button"
                  onClick={() => removeTrustStat(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove stat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(config.trustCard.stats || []).length === 0 && (
              <p className="text-xs text-slate-400 italic">No stats — the bottom row will be empty. Click "Add stat" to add one.</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="SEO & Meta Defaults">
        <Field label="Default Meta Title"><input className={INPUT} value={config.global.metaTitle || ''} onChange={(e) => setGlobal('metaTitle', e.target.value)} placeholder="Navara | Integrated Growth Marketing" /></Field>
        <Field label="Default Meta Description">
          <textarea className={`${INPUT} h-20 resize-none`} value={config.global.metaDescription || ''} onChange={(e) => setGlobal('metaDescription', e.target.value)} />
        </Field>
      </Section>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-navara-blue text-white hover:bg-blue-800'
          } disabled:opacity-50`}
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save & Publish Changes</>}
        </button>
      </div>
    </div>
  )
}
