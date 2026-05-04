import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Save, Upload, Loader2, AlertCircle } from 'lucide-react'
import { api, API_BASE_URL, getToken } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

const INPUT = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

function emptyCaseStudy(count = 0) {
  return {
    client: '', title: '', industry: '', market: 'Egypt',
    servicesText: '', challenge: '', outcome: '', slug: '',
    status: 'draft', sortOrder: count, coverImage: null, coverPublicId: null, accentColor: '#FB6107',
  }
}
const EMPTY_FORM = emptyCaseStudy(0)

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  return status === 'published'
    ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Published</span>
    : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Draft</span>
}

async function uploadCover(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE_URL}/api/upload?type=image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Upload failed (${res.status})`)
  }
  return res.json()
}

function CaseStudyForm({ initial, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const imgRef = useRef()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleImageFile(file) {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const { url, publicId } = await uploadCover(file)
      setForm((f) => ({ ...f, coverImage: url, coverPublicId: publicId }))
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{initial.id ? 'Edit Case Study' : 'New Case Study'}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Client Name"><input className={INPUT} value={form.client} onChange={set('client')} placeholder="Clinica Pro" /></Field>
        <Field label="Title / Headline"><input className={INPUT} value={form.title} onChange={set('title')} placeholder="Healthcare Lead Generation — 3× in 90 Days" /></Field>
        <Field label="Industry"><input className={INPUT} value={form.industry} onChange={set('industry')} placeholder="Healthcare" /></Field>
        <Field label="Market">
          <select className={INPUT} value={form.market} onChange={set('market')}>
            <option>Egypt</option><option>KSA</option><option>Both</option>
          </select>
        </Field>
        <Field label="Services Delivered (comma-separated)">
          <input className={INPUT} value={form.servicesText} onChange={set('servicesText')} placeholder="Google Ads, Social Media, SEO" />
        </Field>
        <Field label="URL Slug"><input className={INPUT} value={form.slug} onChange={set('slug')} placeholder="clinica-pro-healthcare" /></Field>
        <Field label="Status">
          <select className={INPUT} value={form.status} onChange={set('status')}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </Field>
        <Field label="Display Order"><input className={INPUT} type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} /></Field>
      </div>

      <Field label="Challenge">
        <textarea className={`${INPUT} h-20 resize-none`} value={form.challenge} onChange={set('challenge')} placeholder="What problem did the client face?" />
      </Field>
      <Field label="Outcome / Result">
        <textarea className={`${INPUT} h-20 resize-none`} value={form.outcome} onChange={set('outcome')} placeholder="What was achieved? Include specific numbers." />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Screenshot / Cover Image">
          <div
            className={`border-2 border-dashed border-slate-200 rounded-lg p-4 text-center transition-colors ${uploading ? 'opacity-60' : 'cursor-pointer hover:border-navara-blue/40 hover:bg-blue-50/30'}`}
            onClick={() => !uploading && imgRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]) }}
          >
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files[0])} />
            {uploading ? (
              <Loader2 size={18} className="mx-auto text-slate-400 mb-1 animate-spin" />
            ) : form.coverImage ? (
              <img src={form.coverImage} alt="preview" className="mx-auto h-20 object-contain rounded" />
            ) : (
              <>
                <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">Click or drag to upload image</p>
              </>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
        </Field>
        <Field label="Accent Colour">
          <div className="flex items-center gap-3">
            <input type="color" value={form.accentColor || '#FB6107'} onChange={set('accentColor')} className="w-10 h-10 rounded cursor-pointer border border-slate-200" />
            <input className={INPUT} value={form.accentColor || '#FB6107'} onChange={set('accentColor')} placeholder="#FB6107" />
          </div>
        </Field>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={busy || uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {busy ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Case Study</>}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

function buildPayload(form) {
  const services = (form.servicesText || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    client: form.client,
    title: form.title,
    industry: form.industry,
    market: form.market,
    services,
    challenge: form.challenge || null,
    outcome: form.outcome || null,
    slug: form.slug,
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    coverImage: form.coverImage || null,
    coverPublicId: form.coverPublicId || null,
    accentColor: form.accentColor || '#FB6107',
  }
}

function rowToFormState(row) {
  return {
    ...EMPTY_FORM,
    ...row,
    servicesText: Array.isArray(row.services) ? row.services.join(', ') : (row.servicesText || ''),
  }
}

export default function DashboardCaseStudies() {
  const { data, loading, error, refetch } = useApi('/api/case-studies/admin', { auth: true })
  const items = Array.isArray(data) ? data : []
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function handleSave(form) {
    setBusy(true)
    setActionError(null)
    try {
      const payload = buildPayload(form)
      if (form.id) {
        await api.put(`/api/case-studies/${form.id}`, payload)
      } else {
        await api.post('/api/case-studies', payload)
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
    if (!confirm('Delete this case study?')) return
    setBusy(true)
    setActionError(null)
    try {
      await api.delete(`/api/case-studies/${id}`)
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleStatus(item) {
    setBusy(true)
    setActionError(null)
    try {
      await api.put(`/api/case-studies/${item.id}`, {
        ...buildPayload(rowToFormState(item)),
        status: item.status === 'published' ? 'draft' : 'published',
      })
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
          <h1 className="text-xl font-bold text-slate-800">Case Studies</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manages the work showcase on the Home and Industries pages.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Plus size={15} /> New Case Study
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {actionError || error?.message}
        </div>
      )}

      {editing && (
        <CaseStudyForm
          initial={editing === 'new' ? emptyCaseStudy(items.length) : rowToFormState(editing)}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          busy={busy}
        />
      )}

      {!editing && (
        <div className="space-y-3">
          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
              <Loader2 size={16} className="inline animate-spin mr-2" />Loading…
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
              No case studies yet. Add your first one.
            </div>
          )}
          {items
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-300 text-xs font-medium">IMG</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-slate-800 text-sm">{item.title || item.client}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {item.industry} · {item.market}
                  </p>
                  {item.outcome && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.outcome}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(item)}
                    disabled={busy}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      item.status === 'published'
                        ? 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
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
