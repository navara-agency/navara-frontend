import { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, useInView, animate } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { Target, Eye, CheckCircle, Calendar, FileCheck, Heart } from 'lucide-react'
import Section from '../components/layout/Section'
import FadeUp from '../components/animations/FadeUp'
import CTABanner from '../components/ui/CTABanner'
import PhotoBackdrop from '../components/ui/PhotoBackdrop'

/* ─── Animated stat counter (handles decimals) ─────────────── */
function StatCount({ to, suffix = '', decimals = 0, duration = 2, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const [val, setVal] = useState(reduced ? to : 0)

  useEffect(() => {
    if (!inView || reduced) return
    const ctrl = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setVal(parseFloat(v.toFixed(decimals))),
    })
    return ctrl.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <span ref={ref} className={className}>{val}{suffix}</span>
}

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

const WHY_POINTS = ['point1', 'point2', 'point3', 'point4', 'point5']

const APPROACH_PILLARS = [
  { key: 'pillar1', icon: Target },
  { key: 'pillar2', icon: Calendar },
  { key: 'pillar3', icon: FileCheck },
  { key: 'pillar4', icon: CheckCircle },
  { key: 'pillar5', icon: Heart },
]

const STATS = [
  { value: 50, suffix: '+', decimals: 0, label: 'Clients', duration: 2 },
  { value: 3, suffix: '', decimals: 0, label: 'Countries', duration: 1.2 },
  { value: 4.2, suffix: '×', decimals: 1, label: 'Avg. ROAS', duration: 2.2 },
]

/* ─── Floating ambient orb ─────────────────────────────────── */
function Orb({ style, animate: anim, transition }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={anim}
      transition={transition}
    />
  )
}

/* ─── Section accent ornament ──────────────────────────────── */
const SectionAccent = ({ center = false }) => (
  <div className={`flex items-center gap-3 mb-5 ${center ? 'justify-center' : ''}`} aria-hidden="true">
    <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary-cyan/50" />
    <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />
    <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary-cyan/50" />
  </div>
)

/* ─── Standard light card ──────────────────────────────────── */
const Card = ({ children, delay = 0, className = '' }) => (
  <FadeUp delay={delay}>
    <motion.div
      className={`relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group ${className}`}
      whileHover={{ y: -5, boxShadow: '0 14px 44px rgba(3,201,224,0.1)' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
      {children}
    </motion.div>
  </FadeUp>
)

/* ─── Glassmorphism card for violet sections ───────────────── */
const GlassCard = ({ children, delay = 0, className = '' }) => (
  <FadeUp delay={delay}>
    <motion.div
      className={`relative rounded-2xl overflow-hidden group ${className}`}
      style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.88)', boxShadow: '0 4px 24px rgba(82,55,159,0.07)' }}
      whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(82,55,159,0.14)' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
      {children}
    </motion.div>
  </FadeUp>
)

const IconBox = ({ icon: Icon, size = 22, boxClass = 'w-12 h-12 rounded-xl mb-5' }) => (
  <div className={`${boxClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
    style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.15) 0%, rgba(82,55,159,0.12) 100%)', border: '1px solid rgba(82,55,159,0.22)' }}>
    <Icon size={size} className="text-primary-cyan" aria-hidden="true" />
  </div>
)

export default function About() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('about.seo.title')}</title>
        <meta name="description" content={t('about.seo.description')} />
        <meta property="og:title" content={t('about.seo.title')} />
        <meta property="og:description" content={t('about.seo.description')} />
        <link rel="canonical" href="https://navaraagency.com/about" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════════
          HERO — dark with continuous floating animations
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[70vh] flex items-center overflow-hidden bg-primary-dark-blue pt-32 pb-24"
        aria-label="About hero"
      >
        <PhotoBackdrop src="/brand/AbstractBG/ab3.webp" opacity={0.14} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(155deg, rgba(6,0,120,0.9) 0%, rgba(4,0,78,0.85) 60%, rgba(20,5,100,0.9) 100%)' }} />

        {/* Pulsing concentric rings */}
        {!reduced && [0, 1, 2].map(i => (
          <motion.div key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 260 + i * 170, height: 260 + i * 170,
              top: '50%', left: '50%', x: '-50%', y: '-50%',
              border: '1px solid rgba(3,201,224,0.1)',
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeOut', delay: i * 1.8 }}
          />
        ))}

        {/* Floating orbs */}
        <Orb style={{ top: '10%', right: '10%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(3,201,224,0.12) 0%, transparent 70%)', filter: 'blur(65px)' }}
          animate={reduced ? {} : { y: [0, -26, 0], x: [0, 16, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <Orb style={{ bottom: '8%', left: '5%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(82,55,159,0.18) 0%, transparent 70%)', filter: 'blur(55px)' }}
          animate={reduced ? {} : { y: [0, 20, 0], x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
        <Orb style={{ top: '45%', left: '2%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,165,205,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }}
          animate={reduced ? {} : { y: [0, -16, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />

        {/* Diagonal shimmer sweep */}
        {!reduced && (
          <motion.div aria-hidden="true" className="absolute pointer-events-none"
            style={{ width: 3, height: '220%', top: '-60%', background: 'linear-gradient(to bottom, transparent 0%, rgba(3,201,224,0.16) 50%, transparent 100%)', rotate: 28, transformOrigin: 'center' }}
            animate={{ left: ['-10%', '115%'] }}
            transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }} />
        )}

        {/* Micro-particles */}
        {!reduced && [
          { cx: '20%', cy: '32%', color: 'rgba(3,201,224,0.7)', size: 3, dur: 4.5, delay: 0 },
          { cx: '38%', cy: '68%', color: 'rgba(82,55,159,0.6)', size: 2, dur: 6, delay: 1 },
          { cx: '58%', cy: '28%', color: 'rgba(255,165,205,0.6)', size: 2.5, dur: 5, delay: 0.7 },
          { cx: '74%', cy: '72%', color: 'rgba(3,201,224,0.5)', size: 2, dur: 7, delay: 2 },
          { cx: '88%', cy: '42%', color: 'rgba(82,55,159,0.7)', size: 3, dur: 5.5, delay: 1.3 },
        ].map((p, i) => (
          <motion.span key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{ left: p.cx, top: p.cy, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -(16 + i * 5), 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <motion.p className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-5"
            style={{ fontSize: '0.8rem' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.2, reduced)}>
            {t('nav.links.about')}
          </motion.p>
          <motion.h1 className="font-handicrafts font-black text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.15 }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.35, reduced)}>
            {t('about.hero.h1')}
          </motion.h1>
          <motion.p className="font-somar text-white/65 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.5, reduced)}>
            {t('about.hero.body')}
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          OUR STORY — floating image + animated stat counters
      ══════════════════════════════════════════════════════════ */}
      <Section variant="white" backdrop={
        <>
          <div aria-hidden="true" className="absolute -top-40 -start-20 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.055) 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div aria-hidden="true" className="absolute -bottom-20 -end-20 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text + stats */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionAccent />
            <h2 className="font-handicrafts font-bold text-primary-dark-blue mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('about.story.h2')}
            </h2>
            <p className="font-somar text-text-gray leading-relaxed mb-10"
              style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}>
              {t('about.story.body')}
            </p>

            {/* Animated stat counters */}
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <motion.div key={stat.label}
                  className="relative rounded-xl p-4 text-center overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(3,201,224,0.15)', boxShadow: '0 2px 12px rgba(82,55,159,0.06)' }}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease: 'easeOut' }}
                  whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 24px rgba(3,201,224,0.12)' }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #03c9e0, transparent)' }} />
                  <div className="font-handicrafts font-black text-primary-dark-blue leading-none mb-1"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', backgroundImage: 'linear-gradient(135deg, #060078, #52379f, #03c9e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    <StatCount to={stat.value} suffix={stat.suffix} decimals={stat.decimals} duration={stat.duration} />
                  </div>
                  <p className="font-somar text-text-gray text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: floating image */}
          <motion.div
            initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Continuous float */}
            <motion.div
              animate={reduced ? {} : { y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Animated glow ring behind image */}
              <motion.div aria-hidden="true"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(3,201,224,0.12) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }}
                animate={reduced ? {} : { opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

              <div className="relative rounded-2xl overflow-hidden z-10"
                style={{ boxShadow: '0 24px 64px rgba(3,201,224,0.1), 0 4px 20px rgba(82,55,159,0.1)' }}>
                <div className="absolute inset-0 rounded-2xl z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.07) 0%, transparent 50%)' }}
                  aria-hidden="true" />
                <img src="/brand/Artboard 2@4x.png" alt="" aria-hidden="true"
                  className="w-full object-contain rounded-2xl" loading="lazy" />
              </div>
            </motion.div>

            {/* Decorative corner accents */}
            <motion.div aria-hidden="true"
              className="absolute -bottom-4 -start-4 w-8 h-8 rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.4), rgba(82,55,159,0.3))', border: '2px solid rgba(3,201,224,0.3)' }}
              animate={reduced ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div aria-hidden="true"
              className="absolute -top-3 -end-3 w-5 h-5 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,165,205,0.5)', border: '1px solid rgba(255,165,205,0.4)' }}
              animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          MISSION & VISION — slide in from opposite sides
      ══════════════════════════════════════════════════════════ */}
      <Section variant="light" backdrop={
        <>
          <div aria-hidden="true" className="absolute -top-20 -end-20 w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.06) 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div aria-hidden="true" className="absolute -bottom-20 -start-20 w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </>
      }>
        <FadeUp>
          <SectionAccent center />
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Target, titleKey: 'about.mission.h3', bodyKey: 'about.mission.body', dir: -1 },
            { icon: Eye, titleKey: 'about.vision.h3', bodyKey: 'about.vision.body', dir: 1 },
          ].map(({ icon: Icon, titleKey, bodyKey, dir }, i) => (
            <motion.div key={titleKey}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: dir * 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="relative bg-white border border-gray-100 rounded-2xl p-10 h-full overflow-hidden shadow-sm group"
                whileHover={{ y: -5, boxShadow: '0 14px 44px rgba(3,201,224,0.1)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                <div aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at ${dir === -1 ? '0%' : '100%'} 0%, rgba(82,55,159,0.05) 0%, transparent 65%)` }} />
                {/* Ghost icon watermark */}
                <div aria-hidden="true" className="absolute -bottom-2 -end-2 opacity-[0.04] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-500">
                  <Icon size={80} strokeWidth={1.2} />
                </div>
                <div className="relative z-10">
                  <motion.div
                    initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.3 + i * 0.1 }}
                  >
                    <IconBox icon={Icon} />
                  </motion.div>
                  <h3 className="font-handicrafts font-semibold text-primary-dark-blue text-xl mb-3 group-hover:text-secondary-purple transition-colors duration-300">
                    {t(titleKey)}
                  </h3>
                  <p className="font-somar text-text-gray leading-relaxed text-sm">{t(bodyKey)}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          WHY NAVARA — spring-pop numbers + alternating reveals
      ══════════════════════════════════════════════════════════ */}
      <Section variant="white" backdrop={
        <>
          <div aria-hidden="true" className="absolute -top-40 -start-20 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.055) 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div aria-hidden="true" className="absolute -bottom-20 -end-20 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </>
      }>
        <FadeUp>
          <SectionAccent center />
          <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-14"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            {t('home.whyNavara.h2')}
          </h2>
        </FadeUp>

        <div className="space-y-4 max-w-3xl mx-auto">
          {WHY_POINTS.map((key, i) => {
            const fromLeft = i % 2 === 0
            return (
              <motion.div key={key}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: fromLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="relative flex gap-6 items-start bg-white border border-gray-100 rounded-2xl p-7 overflow-hidden group shadow-sm"
                  whileHover={reduced ? {} : { x: fromLeft ? 6 : -6, boxShadow: '0 10px 36px rgba(3,201,224,0.1)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                  {/* Animated left glow accent */}
                  <motion.div aria-hidden="true"
                    className="absolute start-0 top-0 bottom-0 w-[3px] pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, #03c9e0, #52379f)', transformOrigin: 'top' }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
                  <div aria-hidden="true" className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at ${fromLeft ? '0%' : '100%'} 50%, rgba(3,201,224,0.05) 0%, transparent 65%)` }} />

                  {/* Spring-pop number */}
                  <motion.span
                    className="font-handicrafts font-bold text-primary-cyan flex-shrink-0 leading-none relative z-10"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
                    aria-hidden="true"
                    initial={reduced ? {} : { scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.15 + i * 0.08 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>

                  <div className="relative z-10">
                    <h3 className="font-handicrafts font-semibold text-primary-dark-blue text-lg mb-1">
                      {t(`home.whyNavara.${key}.title`)}
                    </h3>
                    <p className="font-somar text-text-gray text-sm leading-relaxed">
                      {t(`home.whyNavara.${key}.body`)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          OUR APPROACH — violet-tinted raw section (bg gap fix)
          + animated blobs + alternating card reveals
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" aria-label="Our approach"
        style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f0ebff 40%, #f5f8ff 70%, #ece6ff 100%)' }}>

        <Orb style={{ top: '-8%', right: '-4%', width: 580, height: 580, background: 'radial-gradient(circle, rgba(82,55,159,0.09) 0%, transparent 70%)', filter: 'blur(90px)' }}
          animate={reduced ? {} : { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <Orb style={{ bottom: '-6%', left: '-3%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(3,201,224,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={reduced ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />
        <Orb style={{ top: '50%', left: '50%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(82,55,159,0.055) 0%, transparent 70%)', filter: 'blur(70px)', transform: 'translate(-50%, -50%)' }}
          animate={reduced ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 7 }} />

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
          <FadeUp>
            <SectionAccent center />
            <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-14"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('about.approach.h2')}
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPROACH_PILLARS.map(({ key, icon: Icon }, i) => {
              const col = i % 3
              const xDir = col === 0 ? -40 : col === 2 ? 40 : 0
              const yDir = col === 1 ? 30 : 0
              return (
                <motion.div key={key}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, x: xDir, y: yDir }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.65, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="relative rounded-2xl p-7 h-full overflow-hidden group"
                    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(82,55,159,0.07)' }}
                    whileHover={reduced ? {} : { y: -6, boxShadow: '0 16px 48px rgba(82,55,159,0.14)' }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                    <div aria-hidden="true" className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(82,55,159,0.07) 0%, transparent 65%)' }} />
                    <div aria-hidden="true" className="absolute -bottom-2 -end-2 opacity-[0.05] pointer-events-none group-hover:opacity-[0.09] transition-opacity duration-500" style={{ color: 'rgba(82,55,159,1)' }}>
                      <Icon size={72} strokeWidth={1.2} />
                    </div>

                    <div className="relative z-10">
                      <motion.div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                        style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.16) 0%, rgba(82,55,159,0.14) 100%)', border: '1px solid rgba(82,55,159,0.25)' }}
                        initial={reduced ? {} : { rotate: -15, opacity: 0 }}
                        whileInView={{ rotate: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 + i * 0.09 }}
                      >
                        <Icon size={18} className="text-primary-cyan" aria-hidden="true" />
                      </motion.div>
                      <h3 className="font-handicrafts font-semibold text-primary-dark-blue mb-2 text-base group-hover:text-secondary-purple transition-colors duration-300">
                        {t(`about.approach.${key}.title`)}
                      </h3>
                      <p className="font-somar text-text-gray text-sm leading-relaxed">
                        {t(`about.approach.${key}.body`)}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MARKETS WE SERVE — pulsing orbital indicators
      ══════════════════════════════════════════════════════════ */}
      <Section variant="white" backdrop={
        <>
          <div aria-hidden="true" className="absolute -top-40 -start-20 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.055) 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div aria-hidden="true" className="absolute -bottom-20 -end-20 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </>
      }>
        <FadeUp>
          <SectionAccent center />
          <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-12"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            {t('about.markets.h2')}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {['egypt', 'ksa'].map((market, i) => (
            <motion.div key={market}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="relative bg-white border border-gray-100 rounded-2xl p-10 text-center overflow-hidden shadow-sm group"
                whileHover={reduced ? {} : { y: -6, boxShadow: '0 14px 44px rgba(3,201,224,0.1)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, #03c9e0 40%, #52379f 80%, transparent 100%)' }} />
                <div aria-hidden="true" className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(3,201,224,0.05) 0%, transparent 65%)' }} />

                {/* Pulsing orbital indicator */}
                <div className="relative inline-flex items-center justify-center mb-5">
                  {[0, 1].map(ring => (
                    <motion.div key={ring} aria-hidden="true"
                      className="absolute rounded-full"
                      style={{
                        width: 20 + ring * 16, height: 20 + ring * 16,
                        border: '1px solid rgba(3,201,224,0.35)',
                      }}
                      animate={reduced ? {} : { scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: ring * 1 + i * 0.4 }}
                    />
                  ))}
                  <div className="relative w-3 h-3 rounded-full z-10"
                    style={{ background: 'linear-gradient(135deg, #03c9e0, #52379f)' }} />
                </div>

                <div className="relative z-10">
                  <h3 className="font-handicrafts font-semibold text-primary-dark-blue text-xl mb-3 group-hover:text-secondary-purple transition-colors duration-300">
                    {t(`about.markets.${market}.name`)}
                  </h3>
                  <p className="font-somar text-text-gray text-sm leading-relaxed">
                    {t(`about.markets.${market}.body`)}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner headingKey="about.cta.h2" backdrop="/brand/AbstractBG/ab2.jpg" />
    </PageWrapper>
  )
}
