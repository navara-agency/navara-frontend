import { useState, useEffect } from 'react'
import { Save, Check, Loader2, AlertCircle } from 'lucide-react'
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

const EMPTY = {
  global: { linkedinUrl: '', instagramUrl: '', emailContact: '', metaTitle: '', metaDescription: '' },
  eg:  { phone: '', whatsapp: '', office: '', hours: '', ctaSubtext: '', calLink: '' },
  ksa: { phone: '', whatsapp: '', office: '', hours: '', ctaSubtext: '', calLink: '' },
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
      })
    }
  }, [data])

  function setGlobal(k, v) { setConfig((c) => ({ ...c, global: { ...c.global, [k]: v } })) }
  function setEg(k, v)     { setConfig((c) => ({ ...c, eg:     { ...c.eg,     [k]: v } })) }
  function setKsa(k, v)    { setConfig((c) => ({ ...c, ksa:    { ...c.ksa,    [k]: v } })) }

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
