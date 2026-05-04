import { useApi } from '../../hooks/useApi'

const STATUS_PILL = {
  new:       { label: 'New',       cls: 'bg-emerald-100 text-emerald-700' },
  reviewed:  { label: 'Reviewed',  cls: 'bg-indigo-100  text-indigo-700'  },
  contacted: { label: 'Contacted', cls: 'bg-slate-100   text-slate-600'   },
  closed:    { label: 'Closed',    cls: 'bg-slate-200   text-slate-500'   },
}

function StatCard({ num, label, sub, color = 'text-navara-blue' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className={`text-3xl font-extrabold ${color} leading-none mb-1`}>{num}</p>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now - d) / 3600000
  if (diffH < 24) return `Today, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  if (diffH < 48) return 'Yesterday'
  return `${Math.floor(diffH / 24)} days ago`
}

export default function DashboardOverview() {
  const { data: leadsRes } = useApi('/api/leads', { auth: true, query: { limit: 100 } })
  const { data: caseStudies } = useApi('/api/case-studies/admin', { auth: true })
  const { data: testimonials } = useApi('/api/testimonials/admin', { auth: true })
  const { data: faqItems } = useApi('/api/faq/admin', { auth: true })

  const leads = leadsRes?.leads || []
  const cases = Array.isArray(caseStudies) ? caseStudies : []
  const tests = Array.isArray(testimonials) ? testimonials : []
  const faqs = Array.isArray(faqItems) ? faqItems : []

  const newLeads = leads.filter((l) => l.status === 'new').length
  const publishedCases = cases.filter((c) => c.status === 'published').length
  const publishedTestimonials = tests.filter((t) => t.status === 'published').length
  const enabledFaq = faqs.filter((f) => f.enabled).length
  const recent = [...leads].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back. Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard num={newLeads} label="New Leads" sub={`${leads.length} total inquiries`} color="text-navara-orange" />
        <StatCard num={publishedCases} label="Case Studies" sub={`${cases.length - publishedCases} in draft`} />
        <StatCard num={publishedTestimonials} label="Testimonials" sub={`${tests.length - publishedTestimonials} in draft`} />
        <StatCard num={enabledFaq} label="FAQ Items" sub={`${faqs.length - enabledFaq} disabled`} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Inquiries</h2>
          <a href="/dashboard/leads" className="text-xs text-navara-turquoise font-semibold hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Market</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Goal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Received</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No leads yet.</td>
                </tr>
              )}
              {recent.map((lead) => {
                const pill = STATUS_PILL[lead.status] || STATUS_PILL.new
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{lead.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{lead.company}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{lead.market}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{lead.goal || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{formatDate(lead.submittedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${pill.cls}`}>
                        {pill.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Add Case Study', href: '/dashboard/case-studies', desc: 'Publish new work to the website' },
          { label: 'Add Testimonial', href: '/dashboard/testimonials', desc: 'Showcase client feedback' },
          { label: 'Edit FAQ', href: '/dashboard/faq', desc: 'Update questions & answers' },
          { label: 'Upload Logos', href: '/dashboard/logos', desc: 'Manage the trust strip' },
          { label: 'Site Config', href: '/dashboard/site-config', desc: 'Phone, links, hours' },
          { label: 'Translations', href: '/dashboard/translations', desc: 'EN / AR content strings' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-navara-blue/30 hover:shadow-sm transition-all group">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-navara-blue transition-colors">{item.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
