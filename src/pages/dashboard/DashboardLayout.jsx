import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, Folder, MessageSquare, Image,
  HelpCircle, Settings, Globe, LogOut, Menu, X, Bell, User,
  ChevronRight, ArrowLeft, Mail, Server, ShieldCheck,
} from 'lucide-react'
import logo from '../../assets/images/navara-logo-white-200w.png'
import { useAuth } from '../../contexts/AuthContext'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/dashboard/leads', label: 'Leads / Inquiries', icon: Inbox },
    ],
  },
  {
    label: 'Website Content',
    items: [
      { to: '/dashboard/case-studies', label: 'Case Studies', icon: Folder },
      { to: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquare },
      { to: '/dashboard/logos', label: 'Client Logos', icon: Image },
      { to: '/dashboard/faq', label: 'FAQ', icon: HelpCircle },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/dashboard/site-config', label: 'Site Config', icon: Settings },
      { to: '/dashboard/translations', label: 'Translations', icon: Globe },
      { to: '/dashboard/emails', label: 'Email Templates', icon: Mail },
      { to: '/dashboard/email-server', label: 'Email Server', icon: Server },
      { to: '/dashboard/account', label: 'Account', icon: ShieldCheck },
    ],
  },
]

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-white/15 text-white border-l-2 border-navara-turquoise pl-[10px]'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`
      }
    >
      <Icon size={16} className="flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/dashboard/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-navara-blue flex flex-col flex-shrink-0
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Navara" className="h-8 w-auto" />
          </Link>
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-dark">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-white/35">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink key={item.to} {...item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: back to site + sign out + user */}
        <div className="p-3 border-t border-white/10 space-y-1 flex-shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Website</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-navara-turquoise flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin</p>
              <p className="text-[10px] text-white/40 truncate">navara.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center px-5 gap-4">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb will be added per page via context or just title */}
          <div className="flex items-center gap-1 text-sm text-slate-400 min-w-0">
            <span className="text-navara-blue font-semibold">Navara</span>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium truncate">Dashboard</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-navara-blue transition-colors">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-navara-orange rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-navara-blue flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
