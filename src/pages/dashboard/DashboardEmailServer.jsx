import { useState, useEffect } from 'react'
import { Save, Check, Loader2, AlertCircle, Send, Server } from 'lucide-react'
import { api } from '../../lib/api'

const INPUT = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

// Sentinel the API uses to indicate the stored password without exposing it. Sending it
// back unchanged on PUT preserves the stored value (the API ignores the mask sentinel).
const MASK = '••••••••'

function Field({ label, hint, type = 'text', value, onChange, placeholder, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      <input
        type={type}
        className={INPUT}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  )
}

function Section({ title, hint, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</h2>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

const EMPTY = {
  smtpHost: '', smtpPort: 465, smtpSecure: true, smtpUser: '', smtpPass: '',
  fromName: '', fromEmail: '', notifyEmail: '',
}

export default function DashboardEmailServer() {
  const [cfg, setCfg] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  async function fetchCfg() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/email-config')
      setCfg({ ...EMPTY, ...res, smtpPass: res?.smtpPass || '' })
    } catch (err) {
      setError(err?.body?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCfg() }, [])

  function set(k, v) { setCfg((c) => ({ ...c, [k]: v })) }

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      // The backend ignores the password if it equals the mask sentinel, so we can send
      // the whole object verbatim. If the user edited the field, the new value gets stored.
      await api.put('/api/email-config', cfg)
      await fetchCfg()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err?.body?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  async function sendTest() {
    setTesting(true)
    setTestResult(null)
    try {
      await api.post('/api/email-config/test', {})
      setTestResult({ ok: true, message: 'Test email sent to the configured Notify Email.' })
    } catch (err) {
      setTestResult({ ok: false, message: err?.body?.error || err.message })
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 5000)
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading…</div>
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <Server size={18} className="text-navara-blue" />
          <h1 className="text-xl font-bold text-slate-800">Email Server</h1>
        </div>
        <p className="text-sm text-slate-400 mt-0.5">
          SMTP credentials, default sender, and the admin notification email. Used as the fallback for every template
          unless the template overrides them in its Recipients card.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> <span>{error}</span>
        </div>
      )}
      {testResult && (
        <div className={`border rounded-lg px-4 py-2.5 text-sm flex items-start gap-2 ${
          testResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {testResult.ok ? <Check size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
          <span>{testResult.message}</span>
        </div>
      )}

      <Section title="Sender & Notifications" hint="Default From and the inbox that receives admin lead notifications.">
        <Field
          label="From Name"
          hint="Display name shown to recipients (e.g. 'Navara')."
          value={cfg.fromName}
          onChange={(v) => set('fromName', v)}
          placeholder="Navara"
        />
        <Field
          label="From Email"
          hint="Address emails are sent from. Must be authorised on the SMTP server."
          type="email"
          value={cfg.fromEmail}
          onChange={(v) => set('fromEmail', v)}
          placeholder="hello@navaraagency.com"
        />
        <Field
          label="Notify Email"
          hint="Where lead notifications and test emails land. Used as the default Reply-To for visitor-facing emails."
          type="email"
          value={cfg.notifyEmail}
          onChange={(v) => set('notifyEmail', v)}
          placeholder="admin@navaraagency.com"
        />
      </Section>

      <Section title="SMTP Server" hint="Outbound mail server credentials. Use port 465 with TLS for most providers.">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
          <Field label="Host" value={cfg.smtpHost} onChange={(v) => set('smtpHost', v)} placeholder="smtp.hostinger.com" />
          <Field label="Port" type="number" value={cfg.smtpPort} onChange={(v) => set('smtpPort', Number(v) || 0)} placeholder="465" />
          <label className="flex items-center gap-2 cursor-pointer pb-2.5">
            <input
              type="checkbox"
              checked={Boolean(cfg.smtpSecure)}
              onChange={(e) => set('smtpSecure', e.target.checked)}
              className="w-4 h-4 accent-navara-blue"
            />
            <span className="text-sm text-slate-700">Secure (TLS)</span>
          </label>
        </div>
        <Field label="Username" value={cfg.smtpUser} onChange={(v) => set('smtpUser', v)} placeholder="hello@navaraagency.com" />
        <Field
          label="Password"
          hint="Leave the masked value untouched to keep the stored password."
          type="password"
          value={cfg.smtpPass}
          onChange={(v) => set('smtpPass', v)}
          placeholder={cfg.smtpPass === MASK ? MASK : 'enter SMTP password'}
        />
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-navara-blue text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navara-blue/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
        </button>
        <button
          onClick={sendTest}
          disabled={testing}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-slate-300 transition-colors disabled:opacity-50"
          title="Send a plain test email to the Notify Email above"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send test
        </button>
      </div>
    </div>
  )
}
