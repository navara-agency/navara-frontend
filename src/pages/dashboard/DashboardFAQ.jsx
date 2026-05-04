import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, GripVertical, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

const INPUT = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'
const TEXTAREA = `${INPUT} resize-none`

function emptyForm(count = 0) {
  return {
    questionEn: '', answerEn: '',
    questionAr: '', answerAr: '',
    enabled: true,
    // Position auto-fills to next slot — admin can still override before saving
    sortOrder: count,
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function FAQForm({ initial, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initial)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{initial.id ? 'Edit FAQ Item' : 'New FAQ Item'}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">English</span>
          </div>
          <Field label="Question (EN)">
            <input className={INPUT} value={form.questionEn} onChange={set('questionEn')} placeholder="What kind of businesses does Navara work with?" />
          </Field>
          <Field label="Answer (EN)">
            <textarea className={`${TEXTAREA} h-28`} value={form.answerEn} onChange={set('answerEn')} placeholder="We work with growth-focused businesses..." />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Arabic (RTL)</span>
          </div>
          <Field label="Question (AR)">
            <input className={INPUT} dir="rtl" value={form.questionAr} onChange={set('questionAr')} placeholder="ما نوع الشركات التي تعمل معها نفارا؟" />
          </Field>
          <Field label="Answer (AR)">
            <textarea className={`${TEXTAREA} h-28`} dir="rtl" value={form.answerAr} onChange={set('answerAr')} placeholder="نعمل مع الشركات الطموحة..." />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="faq-enabled"
            checked={!!form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="w-4 h-4 accent-navara-blue"
          />
          <label htmlFor="faq-enabled" className="text-sm text-slate-600">Enabled on website</label>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Position</label>
          <input
            type="number"
            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {busy ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save FAQ Item</>}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function DashboardFAQ() {
  const { data, loading, error, refetch } = useApi('/api/faq/admin', { auth: true })
  const items = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function handleSave(form) {
    setBusy(true)
    setActionError(null)
    try {
      const payload = {
        questionEn: form.questionEn, answerEn: form.answerEn,
        questionAr: form.questionAr, answerAr: form.answerAr,
        enabled: !!form.enabled, sortOrder: Number(form.sortOrder) || 0,
      }
      if (form.id) {
        await api.put(`/api/faq/${form.id}`, payload)
      } else {
        await api.post('/api/faq', payload)
      }
      setEditing(null)
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this FAQ item?')) return
    setBusy(true)
    setActionError(null)
    try {
      await api.delete(`/api/faq/${id}`)
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleEnabled(item) {
    setBusy(true)
    setActionError(null)
    try {
      await api.put(`/api/faq/${item.id}`, { ...item, enabled: !item.enabled })
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">FAQ Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Controls the FAQ accordion on the Home page. Both EN and AR editable inline.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Plus size={15} /> New FAQ Item
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {actionError || error?.message}
        </div>
      )}

      {editing && (
        <FAQForm
          initial={editing === 'new' ? emptyForm(items.length) : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          busy={busy}
        />
      )}

      {!editing && (
        <div className="space-y-2">
          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
              <Loader2 size={16} className="inline animate-spin mr-2" /> Loading…
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
              No FAQ items yet.
            </div>
          )}
          {items
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors ${
                  item.enabled ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <GripVertical size={16} className="text-slate-300 flex-shrink-0 mt-0.5 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">#{item.sortOrder ?? 0}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="text-xs text-slate-400">EN + AR</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{item.questionEn}</p>
                  {item.questionAr && (
                    <p className="text-xs text-slate-400 mt-0.5 text-right" dir="rtl">{item.questionAr}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.answerEn}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleEnabled(item)}
                    disabled={busy}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      item.enabled
                        ? 'border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100'
                        : 'border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {item.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setEditing(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-navara-blue text-navara-blue bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    disabled={busy}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
