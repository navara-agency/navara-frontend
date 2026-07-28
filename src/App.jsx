import { Suspense, lazy, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/ScrollToTop'
import StickyBooking from './components/ui/StickyBooking'
import FloatingContacts from './components/ui/FloatingContacts'
import LoadingScreen from './components/ui/LoadingScreen'
import SeoHead from './components/SeoHead'
import { GeoProvider } from './contexts/GeoContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import GeoDevBadge from './components/dev/GeoDevBadge'
import { langFromPath, localizedPath, isPublicPath } from './lib/routes'

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

// Declared once, mounted twice: bare path (English, unchanged and already
// indexed) and /ar-prefixed (Arabic, new). Adding a public page means adding it
// here and to PUBLIC_SLUGS in lib/routes.js — nowhere else.
const PUBLIC_ROUTES = [
  { slug: '',            element: <Home /> },
  { slug: 'about',       element: <About /> },
  { slug: 'services',    element: <Services /> },
  { slug: 'industries',  element: <Industries /> },
  { slug: 'how-we-work', element: <HowWeWork /> },
  { slug: 'contact',     element: <Contact /> },
]

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          {/* English — root, unchanged */}
          {PUBLIC_ROUTES.map(({ slug, element }) => (
            <Route key={`en-${slug}`} path={`/${slug}`} element={element} />
          ))}
          {/* Arabic — /ar prefix */}
          {PUBLIC_ROUTES.map(({ slug, element }) => (
            <Route key={`ar-${slug}`} path={`/ar/${slug}`} element={element} />
          ))}
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

/**
 * Keeps i18n and the <html> attributes slaved to the URL, which is now the only
 * source of truth for language.
 *
 * Also contains a safety net. Any internal <Link to="/contact"> still using the
 * bare react-router Link will drop an Arabic visitor onto the English URL and
 * silently flip their language mid-session. When we see an ar -> en transition
 * the visitor did not ask for (the navbar switcher marks its own navigations
 * with router state), we rewrite the URL back into Arabic. Costs one
 * client-side replace; prevents a confusing language flip.
 *
 * This is a net, not a fix — every internal link should use LocalizedLink.
 */
function LanguageSync() {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const prevLangRef = useRef(null)

  useEffect(() => {
    const urlLang = langFromPath(location.pathname)
    const prevLang = prevLangRef.current
    const deliberateSwitch = Boolean(location.state && location.state.langSwitch)

    if (
      !deliberateSwitch &&
      prevLang === 'ar' &&
      urlLang === 'en' &&
      isPublicPath(location.pathname)
    ) {
      navigate(localizedPath(location.pathname, 'ar') + location.hash, { replace: true })
      return
    }

    prevLangRef.current = urlLang
    if (i18n.language !== urlLang) i18n.changeLanguage(urlLang)
    document.documentElement.dir = urlLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = urlLang
  }, [location.pathname, location.hash, location.state, i18n, navigate])

  return null
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
      <LanguageSync />
      <LoadingScreen />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 min-h-screen">
        <AnimatedRoutes />
      </main>
      <Footer />
      <StickyBooking />
      <FloatingContacts />
      {/*
        Mounted after <AnimatedRoutes> deliberately. react-helmet-async resolves
        duplicate tags in mount order (last wins) and the page components still
        hardcode an identical <link rel="canonical">. Rendering later lets the
        correct per-route canonical + hreflang win without editing six pages.
        See the note in SeoHead.jsx.
      */}
      <SeoHead />
    </div>
  )
}

function DashboardRoot() {
  const { i18n } = useTranslation()

  // Dashboard is an internal English-only tool. It sits at /dashboard with no
  // language prefix, so pin it explicitly rather than letting it inherit
  // whatever the public site's URL-derived language happened to be.
  useEffect(() => {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
    if (i18n.language !== 'en') i18n.changeLanguage('en')
  }, [i18n])

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
