import { useState, useEffect, useMemo } from 'react'
import { Save, Check, Loader2, AlertCircle, Send, RotateCcw, Power, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { api } from '../../lib/api'

const INPUT = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

// Human-readable labels for the three templates. Keep them short so the list stays scannable.
const TEMPLATE_LABELS = {
  lead_notification: {
    title: 'Lead Notification',
    description: 'Sent to your admin email each time a visitor submits the contact form.',
    audience: 'Admin',
  },
  booking_confirmation: {
    title: 'Booking Confirmation',
    description: 'Sent to the visitor immediately after they book a discovery call.',
    audience: 'Visitor',
  },
  booking_reminder: {
    title: 'Booking Reminder',
    description: 'Sent to the visitor 2 hours before the meeting (or ASAP if booked closer).',
    audience: 'Visitor',
  },
}

export default function DashboardEmails() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)

  async function fetchList() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/email-templates')
      setList(res.templates || [])
      if (!selectedKey && res.templates?.length) setSelectedKey(res.templates[0].templateKey)
    } catch (err) {
      setError(err?.body?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Email Templates</h1>
        <p className="text-sm text-slate-400 mt-0.5">Subject + body for every email the site sends. Variables wrapped in <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{`{{name}}`}</code> are substituted at send time.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* ── Template list ── */}
        <aside className="space-y-2">
          {loading && !list.length ? (
            <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading…</div>
          ) : (
            list.map((t) => {
              const label = TEMPLATE_LABELS[t.templateKey] || { title: t.templateKey, audience: '' }
              const isSelected = t.templateKey === selectedKey
              return (
                <button
                  key={t.templateKey}
                  onClick={() => setSelectedKey(t.templateKey)}
                  className={`w-full text-left bg-white border rounded-xl px-4 py-3 transition-colors ${isSelected ? 'border-navara-blue ring-2 ring-navara-blue/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{label.title}</span>
                    <div className="flex items-center gap-1.5">
                      {!t.enabled && <EyeOff size={12} className="text-amber-500" title="Disabled" />}
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{t.subject}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${label.audience === 'Visitor' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {label.audience}
                    </span>
                    {t.enabled ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700">Enabled</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-700">Disabled</span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </aside>

        {/* ── Editor ── */}
        <section>
          {selectedKey && (
            <TemplateEditor
              key={selectedKey}
              templateKey={selectedKey}
              onSaved={fetchList}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function TemplateEditor({ templateKey, onSaved }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  async function fetchOne() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/email-templates/${templateKey}`)
      setData(res)
    } catch (err) {
      setError(err?.body?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOne() }, [templateKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.put(`/api/email-templates/${templateKey}`, {
        subject: data.subject,
        bodyText: data.bodyText,
        bodyHtml: data.bodyHtml,
        enabled: data.enabled,
      })
      setData((d) => ({ ...d, ...res, fromDb: true }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      onSaved?.()
    } catch (err) {
      setError(err?.body?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!window.confirm('Reset this template to the original default? Your edits will be lost.')) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.post(`/api/email-templates/${templateKey}/reset`, {})
      setData((d) => ({ ...d, ...res }))
      onSaved?.()
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
      const res = await api.post(`/api/email-templates/${templateKey}/test`, {})
      setTestResult({ ok: true, message: `Test sent to ${res.sentTo}` })
    } catch (err) {
      setTestResult({ ok: false, message: err?.body?.error || err.message })
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 4500)
    }
  }

  if (loading && !data) {
    return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading template…</div>
  }
  if (!data) return null

  const label = TEMPLATE_LABELS[templateKey] || { title: templateKey, description: '' }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{label.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{label.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setData((d) => ({ ...d, enabled: !d.enabled }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${data.enabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
            title={data.enabled ? 'Click to disable this template' : 'Click to enable this template'}
          >
            <Power size={12} /> {data.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {testResult && (
        <div className={`border rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 ${testResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {testResult.ok ? <Check size={14} /> : <AlertCircle size={14} />} {testResult.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Subject</h3>
        </div>
        <div className="p-5">
          <input
            className={INPUT}
            value={data.subject || ''}
            onChange={(e) => setData((d) => ({ ...d, subject: e.target.value }))}
            placeholder="e.g. Your call with Navara is confirmed — {{meetingDay}}"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Plain Text Body</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Sent to email clients that don't render HTML. Also used by spam filters to verify content.</p>
            </div>
            <div className="p-5">
              <textarea
                className={`${INPUT} font-mono text-xs leading-relaxed`}
                rows={12}
                value={data.bodyText || ''}
                onChange={(e) => setData((d) => ({ ...d, bodyText: e.target.value }))}
              />
            </div>
          </div>

          {data.htmlSupported && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">HTML Body</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Inner content only — header logo + footer are added automatically. You can use inline HTML tags.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navara-blue transition-colors"
                  title="Render preview with sample data"
                >
                  {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPreview ? 'Hide preview' : 'Show preview'}
                </button>
              </div>
              <div className="p-5">
                {showPreview ? (
                  <HtmlPreview html={data.bodyHtml || ''} variables={data.variables || []} />
                ) : (
                  <textarea
                    className={`${INPUT} font-mono text-xs leading-relaxed`}
                    rows={18}
                    value={data.bodyHtml || ''}
                    onChange={(e) => setData((d) => ({ ...d, bodyHtml: e.target.value }))}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <aside>
          <VariablePalette variables={data.variables || []} />
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-navara-blue text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navara-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
        </button>

        <button
          onClick={sendTest}
          disabled={testing}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-slate-300 transition-colors disabled:opacity-50"
          title="Send a sample render of this template to your admin email"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send test
        </button>

        <button
          onClick={reset}
          disabled={saving}
          className="flex items-center gap-2 text-slate-500 text-sm font-medium px-3 py-2.5 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Reset to the canonical default — your edits will be lost"
        >
          <RotateCcw size={13} /> Reset to default
        </button>
      </div>
    </div>
  )
}

// Right-rail variable palette — click any pill to copy the {{name}} to clipboard.
function VariablePalette({ variables }) {
  const [copied, setCopied] = useState(null)
  if (!variables.length) return null

  async function copy(name) {
    const token = `{{${name}}}`
    try {
      await navigator.clipboard.writeText(token)
      setCopied(name)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // older browsers — fall back to no-op rather than throwing
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-4">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Variables</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Click to copy.</p>
      </div>
      <ul className="p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
        {variables.map((v) => (
          <li key={v.name}>
            <button
              type="button"
              onClick={() => copy(v.name)}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <code className={`text-[11px] font-mono ${copied === v.name ? 'text-emerald-600' : 'text-navara-blue'}`}>
                {`{{${v.name}}}`}
              </code>
              {copied === v.name && <span className="text-[10px] text-emerald-600 ml-1.5">Copied!</span>}
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{v.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Renders HTML with placeholder substitutions filled by sample values, inside a sandboxed
// iframe so the preview can't escape into the dashboard styles.
function HtmlPreview({ html, variables }) {
  const sample = useMemo(() => ({
    leadName: 'Aisha Ali', leadCompany: 'Acme Co', leadEmail: 'aisha@example.com',
    leadPhone: '+201001234567', leadMarket: 'Egypt', leadIndustry: 'Healthcare',
    leadGoal: 'Generate qualified leads', leadServices: 'Brand Presence, Demand Generation',
    leadBudget: '$3,000–$6,000', leadNote: 'Looking to ramp up Q3.', leadId: 999,
    submittedAt: new Date().toISOString(),
    visitorName: 'Aisha Ali', visitorEmail: 'aisha@example.com', companyName: 'Navara',
    meetingStart: 'Monday, May 26, 2026, 10:00 AM GMT+2', meetingDay: 'Monday',
    meetingDuration: 30, meetingUrl: 'https://meet.google.com/abc-defg-hij',
    rescheduleUrl: 'https://cal.com/reschedule/sample-uid', minutesUntil: 120,
  }), [])

  const substituted = useMemo(() => {
    const escape = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    return (html || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => escape(sample[k]))
  }, [html, sample])

  const wrapped = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;margin:0;padding:24px;background:#f5f4fa;color:#1a1235;}</style></head><body>${substituted}</body></html>`

  return (
    <iframe
      title="Email preview"
      srcDoc={wrapped}
      className="w-full h-[460px] rounded-lg border border-slate-200 bg-white"
      sandbox=""
    />
  )
}
