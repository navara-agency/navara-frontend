import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Mail, MapPin, Clock, Calendar } from 'lucide-react'
import FadeUp from '../components/animations/FadeUp'
import PhotoBackdrop from '../components/ui/PhotoBackdrop'
import IntlPhoneInput from '../components/ui/IntlPhoneInput'
import { api, ApiError } from '../lib/api'
import { useGeo } from '../contexts/GeoContext'
import { useApi } from '../hooks/useApi'

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
)

const fade = (delay, reduced) =>
  reduced ? { duration: 0 } : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }

// Geo market → ISO2 used by the phone input's flag/code default
const MARKET_TO_ISO = { Egypt: 'EG', KSA: 'SA' }

const INDUSTRY_OPTIONS = ['healthcare', 'ecommerce', 'servicesBusiness', 'realEstate', 'automotive', 'retail', 'multiBranch', 'other']
const GOAL_OPTIONS = ['presence', 'leads', 'both', 'notSure']
const SERVICES_OPTIONS = ['brandPresence', 'demandGeneration', 'growthPartner360']
const BUDGET_OPTIONS = ['under1k', '1kTo3k', '3kTo6k', '6kPlus', 'preferNot']


// Number of bookable days the picker should always surface, and the maximum window we
// search through to find them. Cal.com returns empty for non-working days (weekends,
// holidays, etc.), so we scan ahead and show only the days that actually have slots.
const TARGET_AVAILABLE_DAYS = 3
const MAX_SCAN_AHEAD = 21

function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ThreeDayDateTimePicker({ dateValue, onDateChange, slotValue, onSlotChange }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Build candidate dates (today + up to MAX_SCAN_AHEAD days) and fetch availability for
  // all of them in parallel. We then keep the first TARGET_AVAILABLE_DAYS that have slots.
  const candidates = useMemo(() => {
    const t0 = new Date()
    return Array.from({ length: MAX_SCAN_AHEAD + 1 }, (_, offset) => {
      const d = new Date(t0)
      d.setDate(t0.getDate() + offset)
      return d
    })
  }, [])

  const [slotsByDate, setSlotsByDate] = useState({})
  const [calConfigured, setCalConfigured] = useState(true)
  const [scanLoading, setScanLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setScanLoading(true)
    Promise.all(candidates.map(async (d) => {
      const ds = fmtLocalDate(d)
      try {
        const res = await api.get('/api/calcom/slots', { query: { date: ds, timezone } })
        return { ds, slots: Array.isArray(res?.slots) ? res.slots : [], configured: res?.configured !== false }
      } catch {
        return { ds, slots: [], configured: true }
      }
    })).then((results) => {
      if (cancelled) return
      const map = {}
      let anyConfigured = false
      for (const r of results) {
        map[r.ds] = r.slots
        if (r.configured) anyConfigured = true
      }
      setSlotsByDate(map)
      setCalConfigured(anyConfigured)
      setScanLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone])

  // Pick the first N candidates that have at least one slot — skipping weekends/holidays/full days.
  const visibleDays = useMemo(() => {
    const result = []
    for (const d of candidates) {
      const ds = fmtLocalDate(d)
      const slots = slotsByDate[ds]
      if (Array.isArray(slots) && slots.length > 0) {
        result.push(d)
        if (result.length === TARGET_AVAILABLE_DAYS) break
      }
    }
    return result
  }, [candidates, slotsByDate])

  // Auto-select the first available day on first load if user hasn't picked one.
  useEffect(() => {
    if (!dateValue && visibleDays.length > 0) {
      onDateChange(fmtLocalDate(visibleDays[0]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDays.length])

  const apiSlots = dateValue ? (slotsByDate[dateValue] || []) : []
  const noConfigured = !calConfigured && !scanLoading
  const noAvailability = !scanLoading && calConfigured && visibleDays.length === 0

  const formatSlot = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return iso
    }
  }

  // Label: "Today" if the visible day is actually today, else weekday short name
  const todayStr = fmtLocalDate(new Date())
  const labelFor = (d) => (fmtLocalDate(d) === todayStr ? t('contact.form.today') : d.toLocaleDateString(locale, { weekday: 'short' }))

  return (
    <div className="space-y-3">
      <div>
        <span className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.preferredDate')}</span>

        {scanLoading ? (
          <p className="font-somar text-xs text-gray-500 mt-2">Loading availability…</p>
        ) : noConfigured ? (
          <p className="font-somar text-xs text-gray-500 mt-2">
            Auto-booking isn&rsquo;t configured yet — submit the form and we&rsquo;ll send you available times.
          </p>
        ) : noAvailability ? (
          <p className="font-somar text-xs text-gray-500 mt-2">
            No availability in the next {MAX_SCAN_AHEAD} days — submit the form and we&rsquo;ll suggest times.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-2">
            {visibleDays.map((d) => {
              const dateStr = fmtLocalDate(d)
              const isSelected = dateValue === dateStr
              return (
                <motion.button
                  key={dateStr}
                  type="button"
                  onClick={() => onDateChange(dateStr)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={`rounded-xl border py-3 px-2 text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-primary-cyan bg-primary-cyan/10'
                      : 'border-gray-200 bg-white hover:border-primary-cyan/50'
                  }`}
                >
                  <div className={`font-somar text-xs mb-1 ${isSelected ? 'text-primary-cyan' : 'text-gray-400'}`}>
                    {labelFor(d)}
                  </div>
                  <div className={`font-handicrafts font-bold text-2xl ${isSelected ? 'text-primary-dark-blue' : 'text-gray-800'}`}>
                    {d.getDate()}
                  </div>
                  <div className={`font-somar text-xs mt-1 ${isSelected ? 'text-primary-cyan' : 'text-gray-400'}`}>
                    {d.toLocaleDateString(locale, { month: 'short' })}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {dateValue && !scanLoading && !noConfigured && !noAvailability && (
        <div>
          <span className="block font-somar text-sm font-medium text-text-dark mb-1.5">
            Time slot <span className="text-gray-400 font-normal">(your timezone)</span>
          </span>
          {apiSlots.length === 0 ? (
            <p className="font-somar text-xs text-gray-500 mt-1">No availability on this date — pick another.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {apiSlots.map((slot) => {
                const isSelected = slotValue === slot.start
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => onSlotChange(slot.start)}
                    className={`rounded-lg border py-2 px-2 text-center font-somar text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-cyan bg-primary-cyan/10 text-primary-dark-blue font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-cyan/50'
                    }`}
                  >
                    {formatSlot(slot.start)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Contact() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState(null)
  const heroRef = useRef(null)
  const successRef = useRef(null)

  // Live contact info + market from GeoContext / site config — market is used only to seed
  // the phone-input flag default; we no longer ask the visitor to pick a market.
  const { market: geoMarket, config: geoConfig } = useGeo()
  const { data: siteConfig } = useApi('/api/site-config')
  const liveEmail = siteConfig?.global?.emailContact
  const liveOffice = geoConfig?.officeAddress
  const liveHours = geoConfig?.workingHours
  const calLink = geoConfig?.calLink || null
  const calUrl = calLink ? `https://cal.com/${calLink}` : null

  const defaultPhoneIso = MARKET_TO_ISO[geoMarket] || 'EG'

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { whatsappNumber: '' },
  })
  const preferredDate = watch('preferredDate')
  const preferredSlot = watch('preferredSlot') // Exact ISO from Cal.com /v2/slots
  const whatsappNumber = watch('whatsappNumber')
  const [bookingResult, setBookingResult] = useState(null)

  const onSubmit = async (data) => {
    setSubmitStatus('submitting')
    setSubmitError(null)
    setBookingResult(null)

    // The slot picker stores the exact ISO start that Cal.com gave us, so the booking
    // request is guaranteed to match an available slot.
    const preferredDateTime = data.preferredSlot || null
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Map react-hook-form fields → /api/leads payload (FR-008). Market is no longer collected
    // from the form — the backend derives it from the phone's country code.
    const payload = {
      name: data.fullName,
      company: data.businessName,
      industry: data.industry,
      goal: data.primaryGoal,
      services: Array.isArray(data.servicesOfInterest) ? data.servicesOfInterest : (data.servicesOfInterest ? [data.servicesOfInterest] : []),
      budget: data.budgetRange,
      phone: data.whatsappNumber || null,
      email: data.email,
      note: [data.briefNote, preferredDateTime ? `Preferred slot: ${preferredDateTime}` : null].filter(Boolean).join('\n'),
      // Date + time + timezone — backend uses these to create the Cal.com booking
      preferredDateTime,
      timezone,
      // Honeypot — must stay empty (R13). Renamed from "website" because browsers autofilled it.
      nv_check_x: data.nv_check_x || '',
    }

    // Dev-only console group so failures aren't opaque while iterating locally.
    // Vite drops `import.meta.env.DEV` branches from production bundles via DCE.
    const debug = import.meta.env.DEV
    if (debug) {
      console.groupCollapsed('[Navara] /api/leads submit')
      console.log('payload:', payload)
    }
    try {
      const res = await api.post('/api/leads', payload, { auth: false })
      if (debug) { console.log('success:', res); console.groupEnd() }
      setBookingResult(res.booking || null)
      setSubmitStatus('success')
      // Scroll up so the user actually sees the success state instead of staring at a blank form area
      requestAnimationFrame(() => {
        const el = successRef.current
        if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
        else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      })
    } catch (err) {
      if (debug) {
        console.error('submit failed:', err)
        if (err instanceof ApiError) {
          console.error('  status:', err.status)
          console.error('  body:  ', err.body)
        }
        console.groupEnd()
      }

      let detail
      if (err instanceof ApiError) {
        if (err.status === 0) detail = 'Network error — is the backend running at VITE_API_BASE_URL? Check the Network tab.'
        else if (err.status === 429) detail = 'Too many submissions from this IP. Restart the backend or wait an hour.'
        else if (err.status === 400) detail = err.body?.error || 'Validation failed — see Console for the payload.'
        else if (err.status >= 500) detail = `Server error (${err.status}): ${err.body?.error || err.message}`
        else detail = `${err.status}: ${err.body?.error || err.message}`
      } else {
        detail = err?.message || 'Unknown error — see Console.'
      }
      setSubmitError(detail)
      setSubmitStatus('error')
    }
  }

  const h1Words = t('contact.hero.h1').split(' ')

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('contact.seo.title')}</title>
        <meta name="description" content={t('contact.seo.description')} />
        <meta property="og:title" content={t('contact.seo.title')} />
        <meta property="og:description" content={t('contact.seo.description')} />
        <link rel="canonical" href="https://navaraagency.com/contact" />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[65vh] flex items-center overflow-hidden bg-primary-dark-blue pt-32 pb-24"
        aria-label="Contact hero"
      >
        <PhotoBackdrop src="/brand/AbstractBG/ab2.jpg" opacity={0.15} parallax sectionRef={heroRef} />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(155deg, rgba(6,0,120,0.92) 0%, rgba(4,0,78,0.88) 55%, rgba(26,10,110,0.92) 100%)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 60%, rgba(3,201,224,0.1) 0%, transparent 55%)' }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <motion.p
            className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-5"
            style={{ fontSize: '0.8rem' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fade(0.2, reduced)}
          >
            {t('nav.links.contact')}
          </motion.p>

          <div className="relative inline-block mb-0">
            <h1
              className="font-handicrafts font-black"
              style={{
                fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #ffffff 25%, #d8b4fe 60%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {h1Words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.28 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block me-[0.28em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Primary wandering spark */}
            {!reduced && (
              <motion.span
                aria-hidden="true"
                className="absolute pointer-events-none block"
                style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  top: '50%', left: '50%',
                  marginTop: -2.5, marginLeft: -2.5,
                  background: 'radial-gradient(circle, #fdf4ff, #e879f9)',
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 10px 4px rgba(232,121,249,0.9), 0 0 26px 10px rgba(192,132,252,0.5), 0 0 50px 20px rgba(168,85,247,0.2)',
                  zIndex: 20,
                }}
                initial={{ opacity: 0, scale: 0, x: -180, y: 10 }}
                animate={{
                  x: [-180, -55, 90, 210, 145, 15, -105, -180],
                  y: [10, -38, -18, 8, 40, 28, -8, 10],
                  opacity: [0, 1, 0.85, 1, 0.72, 0.95, 0.8, 0],
                  scale: [0, 1.4, 1, 1.7, 0.9, 1.3, 1, 0],
                }}
                transition={{ delay: 0.9, duration: 8, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' }}
              />
            )}

            {/* Secondary spark */}
            {!reduced && (
              <motion.span
                aria-hidden="true"
                className="absolute pointer-events-none block"
                style={{
                  width: 3, height: 3,
                  borderRadius: '50%',
                  top: '50%', left: '50%',
                  marginTop: -1.5, marginLeft: -1.5,
                  background: '#c084fc',
                  filter: 'blur(0.3px)',
                  boxShadow: '0 0 6px 3px rgba(192,132,252,0.85)',
                  zIndex: 20,
                }}
                initial={{ opacity: 0, scale: 0, x: 120, y: -18 }}
                animate={{
                  x: [120, -110, -195, -75, 65, 155, 120],
                  y: [-18, -42, 12, 38, 22, -18, -18],
                  opacity: [0, 0.65, 0.5, 0.75, 0.5, 0.6, 0],
                  scale: [0, 1, 0.7, 1.2, 0.8, 1, 0],
                }}
                transition={{ delay: 1.6, duration: 11, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Contact split layout ─────────────────────────────── */}
      <section id="contact-form" className="relative overflow-hidden py-24">
        {/* Background gradient + dot grid */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f0ebff 40%, #f5f8ff 70%, #ece6ff 100%)' }} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(82,55,159,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Ambient orbs */}
        {!reduced && (
          <>
            <motion.div aria-hidden="true"
              className="absolute -top-32 -start-24 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
              animate={{ scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div aria-hidden="true"
              className="absolute -bottom-24 -end-20 w-[440px] h-[440px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.08) 0%, transparent 70%)', filter: 'blur(75px)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </>
        )}

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — contact info */}
            <FadeUp>
              {/* Section accent */}
              <div className="flex items-center gap-3 mb-5" aria-hidden="true">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary-cyan/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary-cyan/50" />
              </div>

              <h2
                className="font-handicrafts font-bold text-primary-dark-blue mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', lineHeight: 1.2 }}
              >
                {t('contact.info.h2')}
              </h2>
              <p className="font-somar text-text-gray mb-8 leading-relaxed"
                style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}>
                {t('contact.info.body')}
              </p>

              <div className="space-y-3 mb-8">
                {/* Email card */}
                <motion.div
                  className="relative rounded-xl p-4 overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 16px rgba(82,55,159,0.06)' }}
                  whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 28px rgba(3,201,224,0.12)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                  <div className="absolute start-0 top-0 bottom-0 w-[3px] pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, #03c9e0, #52379f)' }} aria-hidden="true" />
                  <div className="flex items-start gap-3 ps-2">
                    <Mail size={18} className="text-primary-cyan mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <a href={`mailto:${liveEmail || t('contact.info.email1')}`} className="font-somar text-sm text-primary-dark-blue hover:text-primary-cyan transition-colors block cursor-pointer">
                        {liveEmail || t('contact.info.email1')}
                      </a>
                      {!liveEmail && (
                        <a href={`mailto:${t('contact.info.email2')}`} className="font-somar text-sm text-text-gray hover:text-primary-cyan transition-colors block mt-0.5 cursor-pointer">
                          {t('contact.info.email2')}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Office card */}
                <motion.div
                  className="relative rounded-xl p-4 overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 16px rgba(82,55,159,0.06)' }}
                  whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 28px rgba(3,201,224,0.12)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                  <div className="absolute start-0 top-0 bottom-0 w-[3px] pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, #03c9e0, #52379f)' }} aria-hidden="true" />
                  <div className="flex items-center gap-3 ps-2">
                    <MapPin size={18} className="text-primary-cyan flex-shrink-0" aria-hidden="true" />
                    <span className="font-somar text-sm text-text-gray">{liveOffice || t('contact.info.office')}</span>
                  </div>
                </motion.div>

                {/* Hours card */}
                <motion.div
                  className="relative rounded-xl p-4 overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 16px rgba(82,55,159,0.06)' }}
                  whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 28px rgba(3,201,224,0.12)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                  <div className="absolute start-0 top-0 bottom-0 w-[3px] pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, #03c9e0, #52379f)' }} aria-hidden="true" />
                  <div className="flex items-center gap-3 ps-2">
                    <Clock size={18} className="text-primary-cyan flex-shrink-0" aria-hidden="true" />
                    <span className="font-somar text-sm text-text-gray">{liveHours || t('contact.info.hours')}</span>
                  </div>
                </motion.div>
              </div>

              <p className="font-somar text-sm text-text-gray/60 italic">
                {t('contact.info.expectation')}
              </p>
            </FadeUp>

            {/* Right — contact form */}
            <FadeUp delay={0.1}>
              <div className="relative rounded-2xl p-8 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 32px rgba(82,55,159,0.08)' }}>
                {/* Top accent */}
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                <h3 className="font-handicrafts font-bold text-primary-dark-blue mb-6 text-xl">
                  {t('contact.form.title')}
                </h3>

                {submitStatus === 'success' ? (
                  <div ref={successRef} role="status" aria-live="polite" className="text-center py-10 space-y-5">
                    <div
                      className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #03c9e0, #52379f)' }}
                    >
                      <Calendar size={26} className="text-white" aria-hidden="true" />
                    </div>

                    {/* Confirmed booking */}
                    {bookingResult?.status === 'confirmed' && (
                      <>
                        <p className="font-somar text-primary-dark-blue font-bold text-lg">
                          You&rsquo;re booked! ✓
                        </p>
                        <p className="font-somar text-text-gray text-sm max-w-md mx-auto">
                          Your discovery call is confirmed. Check your inbox for the Cal.com invite — it includes the meeting link and a calendar add-to-cart.
                        </p>
                      </>
                    )}

                    {/* Cal.com booking failed but lead was saved — give them the manual fallback */}
                    {bookingResult?.status === 'failed' && (
                      <>
                        <p className="font-somar text-primary-dark-blue font-medium text-lg">
                          {t('contact.success')}
                        </p>
                        <p className="font-somar text-text-gray text-sm max-w-md mx-auto">
                          We saved your details, but couldn&rsquo;t auto-book the slot. Pick a time below and we&rsquo;ll send the invite manually.
                        </p>
                        {calUrl && (
                          <a
                            href={calUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-somar font-bold text-white"
                            style={{
                              background: 'linear-gradient(to right, #0044ff 0%, #3322cc 42%, #bb33aa 100%)',
                              boxShadow: '0 4px 20px rgba(0,50,255,0.25)',
                            }}
                          >
                            <Calendar size={16} aria-hidden="true" /> Pick a time on Cal.com
                          </a>
                        )}
                      </>
                    )}

                    {/* No booking attempted (no date+time picked) */}
                    {!bookingResult && (
                      <>
                        <p className="font-somar text-primary-dark-blue font-medium text-lg">
                          {t('contact.success')}
                        </p>
                        {calUrl ? (
                          <>
                            <p className="font-somar text-text-gray text-sm max-w-md mx-auto">
                              Want to lock in a slot now? Pick a time on Cal.com.
                            </p>
                            <a
                              href={calUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-somar font-bold text-white"
                              style={{
                                background: 'linear-gradient(to right, #0044ff 0%, #3322cc 42%, #bb33aa 100%)',
                                boxShadow: '0 4px 20px rgba(0,50,255,0.25)',
                              }}
                            >
                              <Calendar size={16} aria-hidden="true" /> Book your call now
                            </a>
                          </>
                        ) : (
                          <p className="font-somar text-text-gray text-sm">
                            We&rsquo;ll be in touch on WhatsApp shortly.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <form
                    id="contact-form-fields"
                    onSubmit={handleSubmit(onSubmit)}
                    aria-label={t('contact.form.title')}
                    noValidate
                  >
                    {submitStatus === 'error' && (
                      <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="font-somar text-sm text-red-600">{t('contact.error')}</p>
                        {submitError && (
                          <p className="font-somar text-xs text-red-500 mt-1 break-words">{submitError}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.fullName')} *</label>
                        <input
                          id="fullName" type="text"
                          placeholder={t('contact.form.fullNamePlaceholder')}
                          className={`w-full border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('fullName', { required: t('contact.validation.fullNameRequired') })}
                        />
                        {errors.fullName && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="businessName" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.businessName')} *</label>
                        <input
                          id="businessName" type="text"
                          placeholder={t('contact.form.businessNamePlaceholder')}
                          className={`w-full border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.businessName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('businessName', { required: t('contact.validation.businessNameRequired') })}
                        />
                        {errors.businessName && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="industry" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.industry')} *</label>
                        <select
                          id="industry"
                          className={`w-full bg-white border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.industry ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('industry', { required: t('contact.validation.industryRequired') })}
                        >
                          <option value="">{t('contact.form.industryPlaceholder')}</option>
                          {INDUSTRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{t(`contact.form.industryOptions.${opt}`)}</option>
                          ))}
                        </select>
                        {errors.industry && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.industry.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="primaryGoal" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.primaryGoal')} *</label>
                        <select
                          id="primaryGoal"
                          className={`w-full bg-white border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.primaryGoal ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('primaryGoal', { required: t('contact.validation.primaryGoalRequired') })}
                        >
                          <option value="">{t('contact.form.primaryGoalPlaceholder')}</option>
                          {GOAL_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{t(`contact.form.primaryGoalOptions.${opt}`)}</option>
                          ))}
                        </select>
                        {errors.primaryGoal && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.primaryGoal.message}</p>}
                      </div>

                      <div>
                        <fieldset>
                          <legend className="block font-somar text-sm font-medium text-text-dark mb-2">{t('contact.form.servicesOfInterest')}</legend>
                          <div className="grid grid-cols-1 gap-2">
                            {SERVICES_OPTIONS.map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" value={opt} className="accent-primary-cyan w-4 h-4" {...register('servicesOfInterest')} />
                                <span className="font-somar text-sm text-text-gray">
                                  {t(`contact.form.servicesOptions.${opt}`)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>

                      <div>
                        <label htmlFor="budgetRange" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.budgetRange')} *</label>
                        <select
                          id="budgetRange"
                          className={`w-full bg-white border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.budgetRange ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('budgetRange', { required: t('contact.validation.budgetRequired') })}
                        >
                          <option value="">{t('contact.form.budgetPlaceholder')}</option>
                          {BUDGET_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{t(`contact.form.budgetOptions.${opt}`)}</option>
                          ))}
                        </select>
                        {errors.budgetRange && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.budgetRange.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="whatsappNumber" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.whatsapp')} *</label>
                        {/* IntlPhoneInput is controlled — we register the field manually with
                            validation, then push the composed E.164 value via setValue. */}
                        <input type="hidden" {...register('whatsappNumber', {
                          required: t('contact.validation.whatsappRequired'),
                          validate: (v) => {
                            const digits = String(v || '').replace(/\D+/g, '')
                            return digits.length >= 8 || t('contact.validation.whatsappInvalid')
                          },
                        })} />
                        <IntlPhoneInput
                          id="whatsappNumber"
                          value={whatsappNumber || ''}
                          onChange={(v) => setValue('whatsappNumber', v, { shouldValidate: true })}
                          defaultIso={defaultPhoneIso}
                          error={Boolean(errors.whatsappNumber)}
                          placeholder={t('contact.form.whatsappPlaceholder')}
                        />
                        {errors.whatsappNumber && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.whatsappNumber.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.email')} *</label>
                        <input
                          id="email" type="email"
                          placeholder={t('contact.form.emailPlaceholder')}
                          className={`w-full border rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:ring-1 transition-colors ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-gray-200 focus:border-primary-cyan focus:ring-primary-cyan/30'}`}
                          {...register('email', {
                            required: t('contact.validation.emailInvalid'),
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('contact.validation.emailInvalid') },
                          })}
                        />
                        {errors.email && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.email.message}</p>}
                      </div>

                      <ThreeDayDateTimePicker
                        dateValue={preferredDate}
                        onDateChange={(date) => { setValue('preferredDate', date, { shouldValidate: true }); setValue('preferredSlot', '', { shouldValidate: true }) }}
                        slotValue={preferredSlot}
                        onSlotChange={(iso) => setValue('preferredSlot', iso, { shouldValidate: true })}
                      />
                      <input type="hidden" {...register('preferredDate', { required: t('contact.validation.dateRequired') })} />
                      <input type="hidden" {...register('preferredSlot', { required: t('contact.validation.slotRequired') })} />
                      {errors.preferredDate && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.preferredDate.message}</p>}
                      {errors.preferredSlot && !errors.preferredDate && <p role="alert" className="font-somar text-xs text-red-500 mt-1">{errors.preferredSlot.message}</p>}

                      {/* Honeypot — bots fill this; humans never see it. R13.
                          Obscure name + autoComplete="off" + new-password trick to avoid browser autofill. */}
                      <div style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                        <label htmlFor="nv_check_x">Leave this empty</label>
                        <input id="nv_check_x" type="text" tabIndex={-1} autoComplete="new-password" {...register('nv_check_x')} />
                      </div>

                      <div>
                        <label htmlFor="briefNote" className="block font-somar text-sm font-medium text-text-dark mb-1.5">{t('contact.form.briefNote')}</label>
                        <textarea
                          id="briefNote" rows={4}
                          placeholder={t('contact.form.briefNotePlaceholder')}
                          className="w-full border border-gray-200 rounded-md px-4 py-3 font-somar text-sm focus:outline-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan/30 transition-colors resize-none"
                          {...register('briefNote', { maxLength: 1000 })}
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={submitStatus === 'submitting'}
                        className="w-full relative overflow-hidden rounded-xl font-somar font-bold text-white py-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(to right, #0044ff 0%, #3322cc 42%, #bb33aa 100%)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: '0 4px 20px rgba(0,50,255,0.25)',
                        }}
                        whileHover={reduced ? {} : { filter: 'brightness(1.1)' }}
                        whileTap={reduced ? {} : { scale: 0.99 }}
                      >
                        {submitStatus === 'submitting' ? t('contact.form.submitting') : t('contact.form.submit')}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
