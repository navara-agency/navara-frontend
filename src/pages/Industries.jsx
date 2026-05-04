import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { Heart, ShoppingCart, RefreshCw, Building2, Car, Store, GitBranch } from 'lucide-react'
import Section from '../components/layout/Section'
import FadeUp from '../components/animations/FadeUp'
import IndustryCard from '../components/ui/IndustryCard'
import CTABanner from '../components/ui/CTABanner'
import PhotoBackdrop from '../components/ui/PhotoBackdrop'

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

const INDUSTRIES = [
  { key: 'industry1', icon: Heart },
  { key: 'industry2', icon: ShoppingCart },
  { key: 'industry3', icon: RefreshCw },
  { key: 'industry4', icon: Building2 },
  { key: 'industry5', icon: Car },
  { key: 'industry6', icon: Store },
  { key: 'industry7', icon: GitBranch },
]

/* Ghost icons drifting in the hero — each has its own motion personality */
const HERO_GHOSTS = [
  { Icon: Heart,        size: 52, left: '6%',   top: '22%', dur: 7,   dx: 10,  dy: -18, rotA: 8,   delay: 0 },
  { Icon: ShoppingCart, size: 40, left: '20%',  top: '68%', dur: 9,   dx: -8,  dy: -14, rotA: -6,  delay: 1.2 },
  { Icon: Building2,    size: 58, left: '78%',  top: '15%', dur: 8,   dx: -12, dy: -20, rotA: 10,  delay: 0.5 },
  { Icon: Car,          size: 44, left: '88%',  top: '70%', dur: 10,  dx: 8,   dy: -12, rotA: -8,  delay: 2 },
  { Icon: Store,        size: 36, left: '50%',  top: '78%', dur: 6.5, dx: -6,  dy: -16, rotA: 5,   delay: 0.8 },
  { Icon: GitBranch,    size: 46, left: '62%',  top: '28%', dur: 11,  dx: 10,  dy: -10, rotA: -12, delay: 1.7 },
]

/* RefreshCw spins continuously — placed separately */
const SPIN_GHOST = { size: 38, left: '36%', top: '20%' }

function Orb({ style, animate: anim, transition }) {
  return (
    <motion.div aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={style} animate={anim} transition={transition} />
  )
}

const SectionAccent = () => (
  <div className="flex items-center gap-3 mb-5 justify-center" aria-hidden="true">
    <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary-cyan/50" />
    <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />
    <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary-cyan/50" />
  </div>
)

/* Live pulsing badge */
function LiveBadge({ children }) {
  const reduced = useReducedMotion()
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-somar text-xs font-semibold"
      style={{ background: 'rgba(3,201,224,0.08)', border: '1px solid rgba(3,201,224,0.22)', color: '#03c9e0' }}>
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-primary-cyan" />
        {!reduced && (
          <motion.span className="absolute inset-0 rounded-full bg-primary-cyan"
            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }} />
        )}
      </span>
      {children}
    </div>
  )
}

export default function Industries() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const heroRef = useRef(null)

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('industries.seo.title')}</title>
        <meta name="description" content={t('industries.seo.description')} />
        <meta property="og:title" content={t('industries.seo.title')} />
        <meta property="og:description" content={t('industries.seo.description')} />
        <link rel="canonical" href="https://navara.com/industries" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════
          HERO — post-render life: ghost icons + orbs + rings
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center overflow-hidden bg-primary-dark-blue pt-32 pb-24"
        aria-label="Industries hero"
      >
        <PhotoBackdrop src="/brand/AbstractBG/ab4.webp" opacity={0.13} sectionRef={heroRef} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(155deg, rgba(6,0,120,0.9) 0%, rgba(4,0,78,0.85) 55%, rgba(20,5,100,0.9) 100%)' }} />

        {/* ── Pulsing concentric rings ── */}
        {!reduced && [0, 1, 2].map(i => (
          <motion.div key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 240 + i * 180, height: 240 + i * 180,
              top: '50%', left: '50%', x: '-50%', y: '-50%',
              border: '1px solid rgba(3,201,224,0.09)',
            }}
            animate={{ scale: [1, 1.28, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeOut', delay: i * 1.8 }} />
        ))}

        {/* ── Floating ambient orbs ── */}
        <Orb
          style={{ top: '5%', right: '8%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(3,201,224,0.13) 0%, transparent 70%)', filter: 'blur(70px)' }}
          animate={reduced ? {} : { y: [0, -28, 0], x: [0, 14, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        <Orb
          style={{ bottom: '4%', left: '4%', width: 310, height: 310, background: 'radial-gradient(circle, rgba(82,55,159,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={reduced ? {} : { y: [0, 22, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }} />
        <Orb
          style={{ top: '38%', right: '2%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,165,205,0.1) 0%, transparent 70%)', filter: 'blur(45px)' }}
          animate={reduced ? {} : { y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

        {/* ── Diagonal shimmer sweep ── */}
        {!reduced && (
          <motion.div aria-hidden="true" className="absolute pointer-events-none"
            style={{ width: 3, height: '220%', top: '-60%', background: 'linear-gradient(to bottom, transparent 0%, rgba(3,201,224,0.15) 50%, transparent 100%)', rotate: 28, transformOrigin: 'center' }}
            animate={{ left: ['-10%', '115%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5.5, ease: 'easeInOut' }} />
        )}

        {/* ── Floating ghost industry icons ── */}
        {!reduced && HERO_GHOSTS.map(({ Icon, size, left, top, dur, dx, dy, rotA, delay }, i) => (
          <motion.div key={i} aria-hidden="true"
            className="absolute pointer-events-none"
            style={{ left, top, color: i % 2 === 0 ? 'rgba(3,201,224,0.07)' : 'rgba(82,55,159,0.07)' }}
            animate={{ y: [0, dy, 0], x: [0, dx, 0], rotate: [0, rotA, 0], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon size={size} strokeWidth={0.8} />
          </motion.div>
        ))}

        {/* RefreshCw continuously spins */}
        {!reduced && (
          <motion.div aria-hidden="true"
            className="absolute pointer-events-none"
            style={{ left: SPIN_GHOST.left, top: SPIN_GHOST.top, color: 'rgba(3,201,224,0.07)' }}
            animate={{ rotate: 360, y: [0, -10, 0], opacity: [0.04, 0.08, 0.04] }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <RefreshCw size={SPIN_GHOST.size} strokeWidth={0.8} />
          </motion.div>
        )}

        {/* ── Micro-particles ── */}
        {!reduced && [
          { cx: '16%', cy: '35%', color: 'rgba(3,201,224,0.7)',  size: 3, dur: 4.5, delay: 0 },
          { cx: '32%', cy: '72%', color: 'rgba(82,55,159,0.65)', size: 2, dur: 6,   delay: 1 },
          { cx: '54%', cy: '22%', color: 'rgba(255,165,205,0.6)',size: 2.5,dur: 5, delay: 0.6 },
          { cx: '70%', cy: '75%', color: 'rgba(3,201,224,0.5)',  size: 2, dur: 7,   delay: 2.1 },
          { cx: '84%', cy: '45%', color: 'rgba(82,55,159,0.7)',  size: 3, dur: 5.5, delay: 1.4 },
          { cx: '44%', cy: '58%', color: 'rgba(3,201,224,0.45)', size: 2, dur: 8,   delay: 3 },
        ].map((p, i) => (
          <motion.span key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{ left: p.cx, top: p.cy, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -(18 + i * 4), 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
        ))}

        {/* ── Content ── */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <motion.p className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-5"
            style={{ fontSize: '0.8rem' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.2, reduced)}>
            {t('nav.links.industries')}
          </motion.p>
          <motion.h1 className="font-handicrafts font-black text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.15 }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.35, reduced)}>
            {t('industries.hero.h1')}
          </motion.h1>
          <motion.p className="font-somar text-white/65 max-w-2xl mx-auto leading-relaxed mb-8"
            style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.5, reduced)}>
            {t('industries.hero.body')}
          </motion.p>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.7, reduced)}
            className="flex justify-center"
          >
            <LiveBadge>7 Industries · Egypt &amp; KSA</LiveBadge>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          INDUSTRY GRID — dot-grid texture, wave reveal, glassmorphism cards
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" aria-label="Industry grid"
        style={{
          backgroundColor: '#f8f9ff',
          backgroundImage: 'radial-gradient(rgba(82,55,159,0.055) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}>

        {/* Animated atmosphere blobs */}
        <Orb
          style={{ top: '-10%', left: '-4%', width: 560, height: 560, background: 'radial-gradient(circle, rgba(3,201,224,0.06) 0%, transparent 70%)', filter: 'blur(90px)' }}
          animate={reduced ? {} : { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <Orb
          style={{ bottom: '-8%', right: '-3%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(82,55,159,0.07) 0%, transparent 70%)', filter: 'blur(85px)' }}
          animate={reduced ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />
        <Orb
          style={{ top: '45%', left: '48%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(3,201,224,0.05) 0%, transparent 70%)', filter: 'blur(70px)', transform: 'translate(-50%,-50%)' }}
          animate={reduced ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 7 }} />

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
          <FadeUp>
            <SectionAccent />

            {/* "Industries served" live counter badge */}
            <div className="flex justify-center mb-10">
              <LiveBadge>Serving 7 Industries</LiveBadge>
            </div>
          </FadeUp>

          {/* Wave-reveal grid — cards animate from column-appropriate direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES.map(({ key, icon }, i) => {
              const col = i % 3
              const xOff = col === 0 ? -35 : col === 2 ? 35 : 0
              const yOff = col === 1 ? 25 : 0
              return (
                <motion.div key={key}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, x: xOff, y: yOff + 15 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <IndustryCard
                    titleKey={`industries.${key}.title`}
                    bodyKey={`industries.${key}.body`}
                    icon={icon}
                    glowDelay={i * 0.35}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MARKET FOCUS — violet gradient + orbital rings + connecting line
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" aria-label="Market focus"
        style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f0ebff 40%, #f5f8ff 70%, #ece6ff 100%)' }}>

        <Orb
          style={{ top: '-8%', right: '-4%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(82,55,159,0.09) 0%, transparent 70%)', filter: 'blur(90px)' }}
          animate={reduced ? {} : { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <Orb
          style={{ bottom: '-6%', left: '-3%', width: 440, height: 440, background: 'radial-gradient(circle, rgba(3,201,224,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={reduced ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3.5 }} />

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
          <FadeUp>
            <SectionAccent />
            <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-12"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('industries.marketFocus.h2')}
            </h2>
          </FadeUp>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Animated connecting line between cards — desktop only */}
            {!reduced && (
              <div aria-hidden="true" className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none" style={{ width: 48, zIndex: 20 }}>
                <motion.div className="w-full h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(3,201,224,0.4), rgba(82,55,159,0.4))' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} />
                <motion.div className="absolute w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #03c9e0, #52379f)' }}
                  animate={reduced ? {} : { scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
              </div>
            )}

            {['egypt', 'ksa'].map((market, i) => (
              <motion.div key={market}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: i === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="relative rounded-2xl p-10 text-center overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(82,55,159,0.07)' }}
                  whileHover={reduced ? {} : { y: -7, boxShadow: '0 16px 48px rgba(82,55,159,0.14)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, #03c9e0 40%, #52379f 80%, transparent 100%)' }} />
                  <div aria-hidden="true"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(82,55,159,0.07) 0%, transparent 65%)' }} />

                  {/* Pulsing orbital rings */}
                  <div className="relative inline-flex items-center justify-center mb-5">
                    {[0, 1, 2].map(ring => (
                      <motion.div key={ring} aria-hidden="true"
                        className="absolute rounded-full"
                        style={{
                          width: 18 + ring * 16, height: 18 + ring * 16,
                          border: `1px solid rgba(${ring === 0 ? '3,201,224' : '82,55,159'},0.35)`,
                        }}
                        animate={reduced ? {} : { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: ring * 0.8 + i * 0.4 }} />
                    ))}
                    <div className="relative w-3 h-3 rounded-full z-10"
                      style={{ background: 'linear-gradient(135deg, #03c9e0, #52379f)' }} />
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-handicrafts font-semibold text-primary-dark-blue text-xl mb-3 group-hover:text-secondary-purple transition-colors duration-300">
                      {t(`industries.marketFocus.${market}`)}
                    </h3>
                    <p className="font-somar text-text-gray text-sm leading-relaxed">
                      {t(`industries.marketFocus.${market}Body`)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner headingKey="industries.cta.h2" backdrop="/brand/AbstractBG/ab3.webp" />
    </PageWrapper>
  )
}
