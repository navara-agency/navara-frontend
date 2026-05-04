import { useState, useRef } from 'react'
import { Upload, Trash2, GripVertical, Plus, Loader2, AlertCircle } from 'lucide-react'
import { api, API_BASE_URL, getToken } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

function LogoChip({ item, onRemove, busy }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 group">
      <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-slate-400 text-xs font-bold">{item.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
        <p className="text-xs text-slate-400">{item.type === 'partner' ? 'Partner Badge' : 'Client Logo'}</p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        disabled={busy}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-30"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function UploadZone({ onUpload, type, busy }) {
  const ref = useRef()

  function handleFile(file) {
    if (!file) return
    onUpload(file, type)
  }

  return (
    <div
      className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center transition-colors ${busy ? 'opacity-60 pointer-events-none' : 'cursor-pointer hover:border-navara-blue/40 hover:bg-blue-50/30'}`}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      {busy ? <Loader2 size={20} className="mx-auto text-slate-400 mb-2 animate-spin" /> : <Upload size={20} className="mx-auto text-slate-400 mb-2" />}
      <p className="text-sm font-semibold text-slate-600">
        Upload {type === 'partner' ? 'Partner Badge' : 'Client Logo'}
      </p>
      <p className="text-xs text-slate-400 mt-1">SVG/PNG/JPG/WEBP, transparent BG · min 200px wide</p>
      <p className="text-xs text-slate-400">Drag & drop or click to browse</p>
    </div>
  )
}

async function uploadFile(file, type) {
  // Upload via /api/upload?type=logo to Cloudinary; returns { url, publicId }
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE_URL}/api/upload?type=logo`, {
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

export default function DashboardLogos() {
  const { data, loading, error, refetch } = useApi('/api/logos/admin', { auth: true })
  const items = Array.isArray(data) ? data : []
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  const clients = items.filter((i) => i.type === 'client').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const partners = items.filter((i) => i.type === 'partner').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  async function remove(id) {
    setBusy(true)
    setActionError(null)
    try {
      await api.delete(`/api/logos/${id}`)
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(file, type) {
    setBusy(true)
    setActionError(null)
    try {
      const uploaded = await uploadFile(file, type)
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      const sortOrder = items.filter((i) => i.type === type).length
      await api.post('/api/logos', {
        name: baseName,
        type,
        image: uploaded.url,
        publicId: uploaded.publicId,
        sortOrder,
      })
      await refetch()
    } catch (err) {
      setActionError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function addManual(type) {
    const name = prompt(`Enter ${type === 'partner' ? 'partner' : 'client'} name:`)
    if (!name?.trim()) return
    const imageUrl = prompt('Image URL (external CDN — leave blank if none):') || null
    setBusy(true)
    setActionError(null)
    try {
      const sortOrder = items.filter((i) => i.type === type).length
      await api.post('/api/logos', { name: name.trim(), type, image: imageUrl, url: null, sortOrder })
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Client Logos &amp; Partner Badges</h1>
        <p className="text-sm text-slate-400 mt-0.5">Controls the Trust Strip on the Home page.</p>
      </div>

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {actionError || error?.message}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Client Logos</h2>
          <button
            onClick={() => addManual('client')}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-semibold text-navara-blue hover:underline disabled:opacity-50"
          >
            <Plus size={13} /> Add manually
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {loading && <p className="text-sm text-slate-400 text-center py-4"><Loader2 size={14} className="inline animate-spin mr-2" />Loading…</p>}
          {!loading && clients.map((item) => (
            <LogoChip key={item.id} item={item} onRemove={remove} busy={busy} />
          ))}
          {!loading && clients.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No client logos yet.</p>
          )}
        </div>

        <UploadZone type="client" onUpload={handleUpload} busy={busy} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Partner Badges</h2>
          <button
            onClick={() => addManual('partner')}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-semibold text-navara-blue hover:underline disabled:opacity-50"
          >
            <Plus size={13} /> Add manually
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {!loading && partners.map((item) => (
            <LogoChip key={item.id} item={item} onRemove={remove} busy={busy} />
          ))}
          {!loading && partners.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No partner badges yet.</p>
          )}
        </div>

        <UploadZone type="partner" onUpload={handleUpload} busy={busy} />
      </section>
    </div>
  )
}
