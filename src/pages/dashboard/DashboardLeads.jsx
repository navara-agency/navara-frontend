import { useState, useMemo } from 'react'
import { Search, Eye, Check, X, Trash2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { api, ApiError } from '../../lib/api'
import { useApi } from '../../hooks/useApi'

const STATUS_CONFIG = {
  new:       { label: 'New',       cls: 'bg-emerald-100 text-emerald-700' },
  reviewed:  { label: 'Reviewed',  cls: 'bg-indigo-100  text-indigo-700'  },
  contacted: { label: 'Contacted', cls: 'bg-slate-100   text-slate-600'   },
  closed:    { label: 'Closed',    cls: 'bg-slate-200   text-slate-500'   },
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now - d) / 3600000
  if (diffH < 24) return `Today ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  if (diffH < 48) return 'Yesterday'
  return `${Math.floor(diffH / 24)} days ago`
}

function LeadDetail({ lead, onBack, onUpdateStatus, onArchive, busy }) {
  const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
  const services = Array.isArray(lead.services) ? lead.services.join(', ') : (lead.services || '—')
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-slate-800">{lead.name}</h2>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{lead.company} · {lead.market} · {formatDate(lead.submittedAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Full Name',     value: lead.name },
          { label: 'Company',       value: lead.company },
          { label: 'WhatsApp',      value: lead.phone || '—' },
          { label: 'Email',         value: lead.email },
          { label: 'Market',        value: lead.market },
          { label: 'Industry',      value: lead.industry },
          { label: 'Goal',          value: lead.goal || '—' },
          { label: 'Budget Range',  value: lead.budget || '—' },
          { label: 'Services',      value: services },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1">Brief Note</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 min-h-[72px] whitespace-pre-wrap">
          {lead.note ? `"${lead.note}"` : '(none)'}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 pt-1">
        {lead.status !== 'reviewed' && (
          <button
            onClick={() => onUpdateStatus(lead.id, 'reviewed')}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-navara-blue text-navara-blue bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Eye size={14} /> Mark as Reviewed
          </button>
        )}
        {lead.status !== 'contacted' && (
          <button
            onClick={() => onUpdateStatus(lead.id, 'contacted')}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-navara-blue text-navara-blue bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Check size={14} /> Mark as Contacted
          </button>
        )}
        <button
          onClick={() => onUpdateStatus(lead.id, 'closed')}
          disabled={busy || lead.status === 'closed'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Close Lead
        </button>
        <button
          onClick={() => onArchive(lead.id)}
          disabled={busy}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
}

export default function DashboardLeads() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  const query = useMemo(() => {
    const q = {}
    if (filter !== 'all') q.status = filter
    return q
  }, [filter])

  const { data, loading, error, refetch } = useApi('/api/leads', { query, auth: true })
  const leads = data?.leads || []

  const filtered = useMemo(() => {
    if (!search) return leads
    const q = search.toLowerCase()
    return leads.filter(
      (l) => l.name?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q)
    )
  }, [leads, search])

  const { data: detailData } = useApi(
    selectedId ? `/api/leads/${selectedId}` : null,
    { skip: !selectedId, deps: [selectedId], auth: true }
  )
  const activeLead = detailData || (selectedId ? leads.find((l) => l.id === selectedId) : null)

  async function updateStatus(id, status) {
    setBusy(true)
    setActionError(null)
    try {
      await api.patch(`/api/leads/${id}/status`, { status })
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function archive(id) {
    if (!window.confirm('Delete this lead permanently?')) return
    setBusy(true)
    setActionError(null)
    try {
      await api.delete(`/api/leads/${id}`)
      setSelectedId(null)
      await refetch()
    } catch (err) {
      setActionError(err?.body?.error || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Leads / Inquiries</h1>
        <p className="text-sm text-slate-400 mt-0.5">All contact form submissions from the website.</p>
      </div>

      {actionError && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {actionError}
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error instanceof ApiError ? error.message : 'Failed to load leads'}
        </div>
      )}

      {activeLead ? (
        <LeadDetail
          lead={activeLead}
          onBack={() => setSelectedId(null)}
          onUpdateStatus={updateStatus}
          onArchive={archive}
          busy={busy}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 flex-wrap">
            <div className="flex gap-1">
              {['all', 'new', 'reviewed', 'contacted', 'closed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filter === f
                      ? 'bg-navara-blue text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navara-blue/30 w-52"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearch('')}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Name', 'Company', 'Market', 'Industry', 'Budget', 'Received', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                      <Loader2 size={16} className="inline animate-spin mr-2" /> Loading…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                      No leads found.
                    </td>
                  </tr>
                )}
                {filtered.map((lead) => {
                  const pill = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{lead.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{lead.company}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{lead.market}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{lead.industry}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">{lead.budget || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-xs">{formatDate(lead.submittedAt)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${pill.cls}`}>
                          {pill.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedId(lead.id)}
                          className="text-xs font-semibold text-navara-turquoise hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
