import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Phone, MessageCircle } from 'lucide-react'
import { WHATSAPP_FULL_URL, PHONE_NUMBER, PHONE_DISPLAY, LINKEDIN_URL, INSTAGRAM_URL, WHATSAPP_MESSAGE } from '../../config/links'
import { useGeo } from '../../contexts/GeoContext'
import { useApi } from '../../hooks/useApi'

function digitsOnly(value) {
  return (value || '').replace(/[^\d]/g, '')
}
function buildWhatsappUrl(number) {
  const digits = digitsOnly(number)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${WHATSAPP_MESSAGE}`
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function LinkedinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function SideTab({ href, label, icon: Icon, bg, ringColor, side, motionProps, transition, hoverLabel, topStyle, mobileHide = false }) {
  const isLeft = side === 'left'
  const roundedClass = isLeft ? 'rounded-r-full' : 'rounded-l-full'
  const edgeClass = isLeft ? 'left-0' : 'right-0'
  const innerPad = isLeft ? 'sm:pl-1 sm:pr-3 pl-0.5 pr-2' : 'sm:pr-1 sm:pl-3 pr-0.5 pl-2'
  const labelClass = isLeft ? 'ml-2' : 'mr-2 order-first'

  return (
    <motion.a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      aria-label={label}
      {...motionProps}
      transition={transition}
      className={`
        fixed z-40 -translate-y-1/2 group items-center cursor-pointer
        ${mobileHide ? 'hidden sm:flex' : 'flex'}
        ${edgeClass} ${roundedClass} ${innerPad}
        ${bg} text-white shadow-xl hover:shadow-2xl
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
        focus-visible:ring-offset-2 ${ringColor}
        transition-shadow duration-200 py-1.5 sm:py-2.5
      `}
      style={{ top: topStyle }}
    >
      <span className="flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 bg-white/15 rounded-full shrink-0">
        <span className="sm:hidden"><Icon size={12} aria-hidden="true" /></span>
        <span className="hidden sm:block"><Icon size={18} aria-hidden="true" /></span>
      </span>
      {hoverLabel && (
        <span
          className={`
            overflow-hidden max-w-0 group-hover:max-w-[9rem]
            transition-[max-width] duration-300 ease-out
            font-somar text-sm font-semibold whitespace-nowrap
            hidden sm:inline
            ${labelClass}
          `}
        >
          {hoverLabel}
        </span>
      )}
    </motion.a>
  )
}

const SCROLL_THRESHOLD = 300
const GAP = 56 // px between stacked icons

export default function FloatingContacts() {
  const { t, i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const isRTL = i18n.language === 'ar'

  // Live phone/WhatsApp from geo-detected market; site-wide social URLs from site-config
  const { config: geoConfig } = useGeo()
  const { data: siteConfig } = useApi('/api/site-config')

  const phoneRaw = geoConfig?.phone || PHONE_NUMBER
  const phoneDisplay = geoConfig?.phone || PHONE_DISPLAY
  const whatsappUrl = buildWhatsappUrl(geoConfig?.whatsapp) || WHATSAPP_FULL_URL
  const linkedinUrl = siteConfig?.global?.linkedinUrl || LINKEDIN_URL
  const instagramUrl = siteConfig?.global?.instagramUrl || INSTAGRAM_URL

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fromLeft = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -100, opacity: 0 } }

  const fromRight = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 100, opacity: 0 } }

  const spring = { type: 'spring', stiffness: 280, damping: 28 }

  const phoneSide = isRTL ? 'right' : 'left'
  const socialSide = isRTL ? 'left' : 'right'
  const phoneMotion = isRTL ? fromRight : fromLeft
  const socialMotion = isRTL ? fromLeft : fromRight

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Phone — left */}
          <SideTab
            href={`tel:${digitsOnly(phoneRaw) || PHONE_NUMBER}`}
            label={t('floatingContacts.phone')}
            icon={Phone}
            bg="bg-navara-blue"
            ringColor="focus-visible:ring-offset-navara-blue"
            side={phoneSide}
            motionProps={phoneMotion}
            transition={{ ...spring, delay: 0.05 }}
            hoverLabel={phoneDisplay}
            topStyle="50%"
          />

          {/* WhatsApp — right top */}
          <SideTab
            href={whatsappUrl}
            label={t('floatingContacts.whatsapp')}
            icon={MessageCircle}
            bg="bg-[#25D366]"
            ringColor="focus-visible:ring-offset-[#25D366]"
            side={socialSide}
            motionProps={socialMotion}
            transition={{ ...spring, delay: 0.08 }}
            hoverLabel={t('floatingContacts.whatsappLabel')}
            topStyle={`calc(50% - ${GAP}px)`}
          />

          {/* Instagram — right middle */}
          <SideTab
            href={instagramUrl}
            label={t('floatingContacts.instagram')}
            icon={InstagramIcon}
            bg="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045]"
            ringColor="focus-visible:ring-offset-[#FD1D1D]"
            side={socialSide}
            motionProps={socialMotion}
            transition={{ ...spring, delay: 0.14 }}
            hoverLabel={t('floatingContacts.instagramLabel')}
            topStyle="50%"
          />

          {/* LinkedIn — right bottom */}
          <SideTab
            href={linkedinUrl}
            label={t('floatingContacts.linkedin')}
            icon={LinkedinIcon}
            bg="bg-[#0A66C2]"
            ringColor="focus-visible:ring-offset-[#0A66C2]"
            side={socialSide}
            motionProps={socialMotion}
            transition={{ ...spring, delay: 0.20 }}
            hoverLabel={t('floatingContacts.linkedinLabel')}
            topStyle={`calc(50% + ${GAP}px)`}
          />
        </>
      )}
    </AnimatePresence>
  )
}
