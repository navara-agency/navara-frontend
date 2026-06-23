import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/ScrollToTop'
import StickyBooking from './components/ui/StickyBooking'
import FloatingContacts from './components/ui/FloatingContacts'
import LoadingScreen from './components/ui/LoadingScreen'
import { GeoProvider } from './contexts/GeoContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import GeoDevBadge from './components/dev/GeoDevBadge'

// Public site pages — route-level code splitting (T041)
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Industries = lazy(() => import('./pages/Industries'))
const HowWeWork = lazy(() => import('./pages/HowWeWork'))
const Contact = lazy(() => import('./pages/Contact'))

// Dashboard pages — separate chunk, no public Navbar/Footer
const DashboardLayout      = lazy(() => import('./pages/dashboard/DashboardLayout'))
const DashboardOverview    = lazy(() => import('./pages/dashboard/DashboardOverview'))
const DashboardLeads       = lazy(() => import('./pages/dashboard/DashboardLeads'))
const DashboardCaseStudies = lazy(() => import('./pages/dashboard/DashboardCaseStudies'))
const DashboardTestimonials= lazy(() => import('./pages/dashboard/DashboardTestimonials'))
const DashboardLogos       = lazy(() => import('./pages/dashboard/DashboardLogos'))
const DashboardFAQ         = lazy(() => import('./pages/dashboard/DashboardFAQ'))
const DashboardSiteConfig  = lazy(() => import('./pages/dashboard/DashboardSiteConfig'))
const DashboardTranslations= lazy(() => import('./pages/dashboard/DashboardTranslations'))
const DashboardEmails      = lazy(() => import('./pages/dashboard/DashboardEmails'))
const DashboardEmailServer = lazy(() => import('./pages/dashboard/DashboardEmailServer'))
const DashboardAccount     = lazy(() => import('./pages/dashboard/DashboardAccount'))
const DashboardLogin       = lazy(() => import('./pages/dashboard/DashboardLogin'))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

// Warm the public route chunks while the browser is idle so in-app navigation
// renders immediately instead of waiting on a network fetch for the page's JS.
// Dynamic import() is deduped by the browser, so the lazy() routes reuse these.
function prefetchPublicRoutes() {
  import('./pages/About')
  import('./pages/Services')
  import('./pages/Industries')
  import('./pages/HowWeWork')
  import('./pages/Contact')
}

function PublicSite() {
  const { i18n } = useTranslation()

  // Sync <html> dir and lang attributes whenever language changes (US5)
  useEffect(() => {
    const lang = i18n.language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [i18n.language])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchPublicRoutes, { timeout: 1000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(prefetchPublicRoutes, 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <LoadingScreen />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 min-h-screen">
        <AnimatedRoutes />
      </main>
      <Footer />
      <StickyBooking />
      <FloatingContacts />
    </div>
  )
}

function DashboardRoot() {
  // Dashboard always LTR regardless of public site language setting
  useEffect(() => {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
  }, [])

  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Public login route — outside the ProtectedRoute guard */}
        <Route path="login" element={<DashboardLogin />} />

        {/* Protected dashboard surface */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="leads"         element={<DashboardLeads />} />
          <Route path="case-studies"  element={<DashboardCaseStudies />} />
          <Route path="testimonials"  element={<DashboardTestimonials />} />
          <Route path="logos"         element={<DashboardLogos />} />
          <Route path="faq"           element={<DashboardFAQ />} />
          <Route path="site-config"   element={<DashboardSiteConfig />} />
          <Route path="translations"  element={<DashboardTranslations />} />
          <Route path="emails"        element={<DashboardEmails />} />
          <Route path="email-server"  element={<DashboardEmailServer />} />
          <Route path="account"       element={<DashboardAccount />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <GeoProvider>
            <GeoDevBadge />
            <Routes>
              {/* Dashboard — own layout, no public Navbar/Footer */}
              <Route path="/dashboard/*" element={<DashboardRoot />} />
              {/* Public marketing site */}
              <Route path="/*" element={<PublicSite />} />
            </Routes>
          </GeoProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
