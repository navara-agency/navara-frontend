import { useState, useEffect } from 'react'
import logoIcon from '../../assets/images/navara-logo-icon.png'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import useLiteMotion from '../../hooks/useLiteMotion'
import LocalizedLink from '../LocalizedLink'
import { langFromPath, stripLang, counterpartPath } from '../../lib/routes'

// Hrefs are written language-agnostically. LocalizedLink adds the /en prefix
// when the visitor is in English.
const NAV_LINKS = [
  { key: 'nav.links.services', href: '/services' },
  { key: 'nav.links.about', href: '/about' },
  { key: 'nav.links.industries', href: '/industries' },
  { key: 'nav.links.howWeWork', href: '/how-we-work' },
  { key: 'nav.links.faqs', href: '/#faq' },
  { key: 'nav.links.contact', href: '/contact' },
]

const NAV_LABEL_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] }

function getNavTarget(to) {
  const [pathname, hash = ''] = to.split('#')
  return {
    pathname: pathname || '/',
    hash: hash ? `#${hash}` : '',
  }
}

// Compare against the language-stripped path: under /en/about the raw pathname
// never equals the '/about' href, so nothing would ever highlight.
function isNavActive(to, location) {
  const target = getNavTarget(to)
  const current = stripLang(location.pathname)

  if (target.hash) {
    return current === target.pathname && location.hash === target.hash
  }

  return current === target.pathname
}

/**
 * The language switcher.
 *
 * Previously an onClick <button> calling i18n.changeLanguage() — it mutated
 * in-memory state and never changed the URL, so a crawler had no way to learn
 * the other language existed. It is now a real anchor pointing at the
 * counterpart URL, which is what makes the Arabic pages discoverable.
 *
 * state.langSwitch tells LanguageSync in App.jsx that this en -> ar navigation
 * was intentional, so its stray-link safety net doesn't bounce it back.
 */
function LanguageSwitch({ className, onNavigate }) {
  const { t } = useTranslation()
  const location = useLocation()
  const lang = langFromPath(location.pathname)
  const target = counterpartPath(location.pathname) + location.hash

  return (
    <Link
      to={target}
      state={{ langSwitch: true }}
      hrefLang={lang === 'en' ? 'ar' : 'en'}
      onClick={onNavigate}
      className={className}
      aria-label={`Switch to ${lang === 'en' ? 'Arabic' : 'English'}`}
    >
      {lang === 'en' ? t('nav.lang.ar') : t('nav.lang.en')}
    </Link>
  )
}

function NavLinkAnimated({ to, label }) {
  const shouldReduceMotion = useReducedMotion()
  const location = useLocation()
  const isRTL = langFromPath(location.pathname) === 'ar'
  const isActive = isNavActive(to, location)

  return (
    <LocalizedLink to={to} aria-current={isActive ? 'page' : undefined}>
      {shouldReduceMotion ? (
        <span
          className={`relative inline-block font-somar font-medium transition-colors duration-200 ${
            isActive ? 'text-primary-cyan' : 'text-white hover:text-primary-cyan'
          }`}
        >
          {label}
          <span
            aria-hidden="true"
            className={`absolute bottom-[-6px] start-0 h-[2px] w-full bg-primary-cyan ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </span>
      ) : (
        <motion.span
          className={`group relative inline-block overflow-hidden h-7 font-somar font-medium ${
            isActive ? 'text-primary-cyan' : 'text-white'
          }`}
          whileHover="hover"
          initial="idle"
          animate="idle"
        >
          {/* Top label copy */}
          <motion.span
            className="block leading-7"
            variants={{ idle: { y: 0 }, hover: { y: '-100%' } }}
            transition={NAV_LABEL_TRANSITION}
          >
            {label}
          </motion.span>
          {/* Bottom label copy (absolute, visible on hover) */}
          <motion.span
            className="absolute inset-x-0 top-0 block leading-7"
            variants={{ idle: { y: '100%' }, hover: { y: 0 } }}
            transition={NAV_LABEL_TRANSITION}
            aria-hidden="true"
          >
            {label}
          </motion.span>
          {/* Underline wipe */}
          <span
            aria-hidden="true"
            className={`absolute bottom-[-6px] start-0 h-[2px] w-full bg-primary-cyan transition-transform duration-300 ease-out ${
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
            style={{ transformOrigin: isRTL ? 'right' : 'left' }}
          />
        </motion.span>
      )}
    </LocalizedLink>
  )
}

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  // Animating the header height/gap forces a layout reflow on every scrolled
  // frame — fine on desktop, a major scroll-jank source on mobile. The
  // compression effect only exists for the lg+ nav anyway.
  const lite = useLiteMotion()
  const { scrollY, scrollYProgress } = useScroll()
  // Direction follows the URL's language, same source of truth as everything else.
  const isRTL = langFromPath(location.pathname) === 'ar'

  // Scroll-driven nav compression: items spread at top, compress on scroll
  const rawGap = useTransform(scrollY, [0, 150], [32, 10])
  const navGapNum = useSpring(rawGap, { stiffness: 260, damping: 32 })
  // gap CSS property needs a "px" string — Framer Motion does NOT auto-append px for gap
  const navGap = useTransform(navGapNum, v => `${Math.round(v)}px`)

  const rawHeight = useTransform(scrollY, [0, 150], [72, 52])
  const navHeight = useSpring(rawHeight, { stiffness: 260, damping: 32 })

  const progressOpacity = useTransform(scrollY, [0, 80], [0, 1])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const mobileVariants = {
    hidden: { x: isRTL ? '-100%' : '100%' },
    visible: { x: 0 },
    exit: { x: isRTL ? '-100%' : '100%' },
  }

  return (
    <>
    <header
      className={`fixed top-0 inset-x-0 z-[1000] transition-[background-color,box-shadow] duration-500 ${
        scrolled
          ? 'bg-primary-dark-blue/95 lg:bg-primary-dark-blue/90 lg:backdrop-blur-md shadow-lg shadow-primary-dark-blue/30'
          : 'bg-transparent'
      }`}
    >
      <motion.nav
        className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between"
        style={!lite ? { height: navHeight } : { height: 64 }}
        aria-label={t('nav.aria')}
      >
        {/* Logo */}
        <LocalizedLink to="/" className="flex-shrink-0">
          <img
            src={logoIcon}
            alt="Navara"
            height={44}
            className="h-11 w-auto"
          />
        </LocalizedLink>

        {/* Desktop links */}
        <motion.div
          className="hidden lg:flex items-center"
          style={!lite ? { gap: navGap } : { gap: 24 }}
        >
          {NAV_LINKS.map(({ key, href }) => (
            <NavLinkAnimated key={key} to={href} label={t(key)} />
          ))}
        </motion.div>

        {/* Desktop right: language switch + CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitch className="text-white font-somar font-medium text-sm hover:text-primary-cyan transition-colors cursor-pointer" />
          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <LocalizedLink
              to="/contact#contact-form"
              className="inline-flex items-center justify-center font-somar font-semibold text-sm text-white border border-white/40 rounded-full px-5 py-2 bg-white/5 hover:bg-white hover:text-primary-dark-blue hover:border-white transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              {t('nav.cta')}
            </LocalizedLink>
          </motion.div>
        </div>

        {/* Mobile: language + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <LanguageSwitch className="text-white font-somar font-medium text-sm hover:text-primary-cyan transition-colors cursor-pointer" />
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white p-1 cursor-pointer"
            aria-label={t('nav.mobileMenuOpen')}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Scroll progress bar */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute bottom-0 inset-x-0 h-0.5 bg-primary-cyan origin-left"
          style={{
            scaleX: scrollYProgress,
            opacity: progressOpacity,
            transformOrigin: isRTL ? 'right' : 'left',
          }}
          aria-hidden="true"
        />
      )}
    </header>

    {/* Mobile overlay — rendered outside <header> so the header's backdrop-blur
        stacking context does not corrupt the panel's background */}
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop — clicking it closes the menu */}
          <motion.div
            className="fixed inset-0 z-[1050] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            className="fixed inset-y-0 end-0 w-full max-w-xs z-[1100] flex flex-col shadow-2xl"
            style={{ backgroundColor: '#060078', willChange: 'transform' }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
          {/* Close button */}
          <div className="flex justify-end p-6">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white cursor-pointer"
              aria-label={t('nav.mobileMenuClose')}
            >
              <X size={28} />
            </button>
          </div>

          {/* Mobile links */}
          <nav className="flex flex-col items-center gap-8 mt-8">
            {NAV_LINKS.map(({ key, href }) => (
              <div key={key}>
                <LocalizedLink
                  to={href}
                  className={`text-2xl font-somar font-semibold ${
                    isNavActive(href, location) ? 'text-primary-cyan' : 'text-white'
                  }`}
                  aria-current={isNavActive(href, location) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(key)}
                </LocalizedLink>
              </div>
            ))}

            <div>
              <LocalizedLink
                to="/contact#contact-form"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center font-somar font-semibold text-white border border-white/40 rounded-full px-8 py-3 bg-white/5 hover:bg-white hover:text-primary-dark-blue transition-all duration-200 cursor-pointer"
              >
                {t('nav.cta')}
              </LocalizedLink>
            </div>
          </nav>
        </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}
