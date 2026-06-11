import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'

/**
 * Floating "Book a Call" button that fades in after the user scrolls
 * past the hero (400 px) and hides again when they're near the footer
 * (within 200 px of the bottom). RTL-aware positioning. Always sends
 * the visitor to the contact form (the form itself handles routing
 * to cal.com after qualifying lead capture).
 */
export default function StickyBooking() {
  const { t, i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const isRTL = i18n.language === 'ar'

  function handleClick() {
    navigate('/contact#contact-form')
  }

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const nearBottom =
          window.innerHeight + scrollY >= document.documentElement.scrollHeight - 200
        setVisible(scrollY > 400 && !nearBottom)
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          className={`fixed bottom-6 z-50 text-white font-somar font-semibold
            px-5 py-3 rounded-full shadow-2xl flex items-center gap-2
            hover:opacity-90 transition-opacity duration-200 cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark-blue
            ${isRTL ? 'left-6' : 'right-6'}`}
          style={{ background: 'linear-gradient(to right, #060078, #3322cc, #03c9e0)' }}
          aria-label={t('nav.cta')}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Calendar size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{t('nav.cta')}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
