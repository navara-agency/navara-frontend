import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Save, Star, Upload, Play, Loader2, AlertCircle } from 'lucide-react'
import { api, API_BASE_URL, getToken, uploadWithProgress } from '../../lib/api'
import { useApi } from '../../hooks/useApi'
import VideoLightbox from '../../components/ui/VideoLightbox'

const INPUT = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

function emptyTestimonial(count = 0) {
  return {
    quote: '', author: '', title: '', company: '',
    industry: '', rating: 5, status: 'draft', sortOrder: count,
    resultsBadge: '',
    photo: null, photoPublicId: null,
    videoUrl: '', videoPublicId: null, thumbnailUrl: null,
    uploadProgress: 0,
  }
}
const EMPTY_FORM = emptyTestimonial(0)

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
          <Star size={20} className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  )
}

async function uploadAsset(file, type) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE_URL}/api/upload?type=${type}`, {
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

function TestimonialForm({ initial, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initial)
  const [testVideo, setTestVideo] = useState(false)
  const [uploading, setUploading] = useState(null) // 'photo' | 'video' | 'thumb' | null
  const [uploadError, setUploadError] = useState(null)

  function handleSubmit() {
    if (!form.quote.trim()) {
      setUploadError('Quote text is required.')
      return
    }
    if (!form.videoUrl) {
      setUploadError('A video is required — upload a file or paste a URL.')
      return
    }
    setUploadError(null)
    onSave(form)
  }
  const photoRef = useRef()
  const videoRef = useRef()
  const thumbRef = useRef()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handlePhoto(file) {
    if (!file) return
    setUploading('photo')
    setUploadError(null)
    try {
      const { url, publicId } = await uploadAsset(file, 'image')
      setForm((f) => ({ ...f, photo: url, photoPublicId: publicId }))
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(null)
    }
  }

  const [videoProgress, setVideoProgress] = useState(0)
  async function handleVideo(file) {
    if (!file) return
    setUploading('video')
    setUploadError(null)
    setVideoProgress(0)
    try {
      // XHR-backed upload to /api/upload?type=video — gives real upload % so the user can see it move.
      const { url, publicId, thumbnailUrl } = await uploadWithProgress('/api/upload', file, {
        type: 'video',
        onProgress: setVideoProgress,
      })
      setForm((f) => ({
        ...f,
        videoUrl: url,
        videoPublicId: publicId,
        thumbnailUrl: thumbnailUrl || f.thumbnailUrl,
      }))
    } catch (err) {
      setUploadError(err.body?.error || err.message)
    } finally {
      setUploading(null)
      setVideoProgress(0)
    }
  }

  function clearVideo() {
    setForm((f) => ({ ...f, videoUrl: '', videoPublicId: null, thumbnailUrl: null }))
  }

  async function handleThumb(file) {
    if (!file) return
    setUploading('thumb')
    setUploadError(null)
    try {
      const { url } = await uploadAsset(file, 'image')
      setForm((f) => ({ ...f, thumbnailUrl: url }))
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{initial.id ? 'Edit Testimonial' : 'New Testimonial'}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <Field label={<>Quote Text <span className="text-red-500">*</span></>}>
        <textarea className={`${INPUT} h-24 resize-none`} value={form.quote} onChange={set('quote')} placeholder='"Navara brought real structure to our monthly operations..."' />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Name (optional)"><input className={INPUT} value={form.author} onChange={set('author')} placeholder="Dr. Sara K." /></Field>
        <Field label="Title (optional)"><input className={INPUT} value={form.title} onChange={set('title')} placeholder="CEO" /></Field>
        <Field label="Company (optional)"><input className={INPUT} value={form.company} onChange={set('company')} placeholder="Clinica Pro" /></Field>
        <Field label="Industry (optional)"><input className={INPUT} value={form.industry} onChange={set('industry')} placeholder="Healthcare" /></Field>
        <Field label="Status">
          <select className={INPUT} value={form.status} onChange={set('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Display Order"><input className={INPUT} type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} /></Field>
      </div>

      <Field label="Results Badge (optional, e.g. '200+ Leads/mo')">
        <input className={INPUT} value={form.resultsBadge || ''} onChange={set('resultsBadge')} />
      </Field>

      <Field label="Star Rating">
        <StarRating value={form.rating || 5} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
      </Field>

      <Field label="Client Photo (optional)">
        <div
          className={`border-2 border-dashed border-slate-200 rounded-lg p-4 text-center transition-colors ${uploading === 'photo' ? 'opacity-60' : 'cursor-pointer hover:border-navara-blue/40 hover:bg-blue-50/30'}`}
          onClick={() => uploading !== 'photo' && photoRef.current?.click()}
        >
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files[0])} />
          {uploading === 'photo' ? (
            <Loader2 size={18} className="mx-auto text-slate-400 mb-1 animate-spin" />
          ) : form.photo ? (
            <img src={form.photo} alt="preview" className="mx-auto h-20 object-contain rounded" />
          ) : (
            <>
              <Upload size={18} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">Click to upload photo</p>
            </>
          )}
        </div>
      </Field>

      <Field label={<>Video <span className="text-red-500">*</span> — upload an MP4/MOV/WEBM or paste a YouTube/external URL</>}>
        <div
          className={`border-2 border-dashed border-slate-200 rounded-lg p-4 text-center transition-colors ${uploading === 'video' ? 'opacity-60' : 'cursor-pointer hover:border-navara-blue/40 hover:bg-blue-50/30'} mb-2`}
          onClick={() => uploading !== 'video' && videoRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleVideo(e.dataTransfer.files[0]) }}
        >
          <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => handleVideo(e.target.files[0])} />
          {uploading === 'video' ? (
            <>
              <Loader2 size={18} className="mx-auto text-slate-400 mb-1 animate-spin" />
              <p className="text-xs text-slate-500 mb-2">
                Uploading{videoProgress > 0 ? `… ${videoProgress}%` : '…'}
              </p>
              <div className="mx-auto h-1.5 w-full max-w-xs rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-navara-blue transition-[width] duration-150"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              {videoProgress >= 100 && (
                <p className="text-[11px] text-slate-400 mt-1.5">Cloudinary processing the file…</p>
              )}
            </>
          ) : form.videoUrl ? (
            <div className="flex items-center justify-center gap-3">
              <video src={form.videoUrl} className="h-16 rounded" muted />
              <div className="text-xs text-slate-600 break-all max-w-[60%]">{form.videoUrl}</div>
            </div>
          ) : (
            <>
              <Upload size={18} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">Click or drag a video file to upload</p>
              <p className="text-xs text-slate-400 mt-0.5">MP4, MOV, WEBM</p>
            </>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <input className={INPUT} value={form.videoUrl || ''} onChange={set('videoUrl')} placeholder="…or paste a video URL (YouTube/Vimeo/MP4)" />
          {form.videoUrl && (
            <>
              <button
                type="button"
                onClick={() => setTestVideo(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navara-blue text-white text-xs font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Play size={12} /> Test
              </button>
              <button
                type="button"
                onClick={clearVideo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </Field>

      <Field label="Custom Thumbnail (auto-derived from uploaded video — only override if needed)">
        <div
          className={`border-2 border-dashed border-slate-200 rounded-lg p-4 text-center transition-colors ${uploading === 'thumb' ? 'opacity-60' : 'cursor-pointer hover:border-navara-blue/40 hover:bg-blue-50/30'}`}
          onClick={() => uploading !== 'thumb' && thumbRef.current?.click()}
        >
          <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleThumb(e.target.files[0])} />
          {uploading === 'thumb' ? (
            <Loader2 size={18} className="mx-auto text-slate-400 mb-1 animate-spin" />
          ) : form.thumbnailUrl ? (
            <img src={form.thumbnailUrl} alt="thumbnail preview" className="mx-auto h-20 object-contain rounded" />
          ) : (
            <>
              <Upload size={18} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">Upload custom thumbnail (optional)</p>
            </>
          )}
        </div>
      </Field>

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

      {testVideo && (
        <VideoLightbox
          videoUrl={form.videoUrl}
          isOpen={testVideo}
          onClose={() => setTestVideo(false)}
          clientName={form.author}
        />
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={busy || !!uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {busy ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Testimonial</>}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

function buildPayload(form) {
  const photo = form.photo || null
  const photoPublicId = form.photoPublicId || null
  const videoUrl = form.videoUrl || null
  // Only pass videoPublicId/thumbnailUrl for Cloudinary uploads (both are set by the uploader).
  // External/YouTube URLs have no publicId or thumbnail — the backend now allows this.
  const videoPublicId = form.videoPublicId || null
  const thumbnailUrl = form.thumbnailUrl || null

  return {
    quote: form.quote,
    author: form.author || null,
    title: form.title || null,
    company: form.company || null,
    industry: form.industry || null,
    rating: Number(form.rating) || 5,
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    resultsBadge: form.resultsBadge || null,
    photo,
    photoPublicId: photo ? photoPublicId : null,
    videoUrl,
    videoPublicId: videoUrl ? videoPublicId : null,
    thumbnailUrl: videoUrl ? thumbnailUrl : null,
  }
}

export default function DashboardTestimonials() {
  const { data, loading, error, refetch } = useApi('/api/testimonials/admin', { auth: true })
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
        await api.put(`/api/testimonials/${form.id}`, payload)
      } else {
        await api.post('/api/testimonials', payload)
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
    if (!confirm('Remove this testimonial?')) return
    setBusy(true)
    setActionError(null)
    try {
      await api.delete(`/api/testimonials/${id}`)
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
      await api.put(`/api/testimonials/${item.id}`, {
        ...buildPayload({ ...EMPTY_FORM, ...item }),
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
          <h1 className="text-xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-sm text-slate-400 mt-0.5">Client quotes displayed on the Home page.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navara-blue text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Plus size={15} /> Add Testimonial
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {actionError || error?.message}
        </div>
      )}

      {editing && (
        <TestimonialForm
          initial={editing === 'new' ? emptyTestimonial(items.length) : { ...EMPTY_FORM, ...editing }}
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
              No testimonials yet.
            </div>
          )}
          {items
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={14} className={n <= (item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 italic line-clamp-2">"{item.quote}"</p>
                    <p className="text-xs text-slate-800 font-semibold mt-2">
                      {item.author}
                      {item.title && <span className="font-normal text-slate-500"> · {item.title}</span>}
                      {item.company && <span className="font-normal text-slate-500">, {item.company}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.industry || '—'} ·{' '}
                      <span className={`font-semibold ${item.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      {item.videoUrl && <span className="ml-2 text-navara-blue font-semibold">· Video</span>}
                    </p>
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
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
