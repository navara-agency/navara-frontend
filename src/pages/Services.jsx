import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { Target, Layers, Palette, Check } from 'lucide-react'
import Section from '../components/layout/Section'
import FadeUp from '../components/animations/FadeUp'
import CTABanner from '../components/ui/CTABanner'
import PhotoBackdrop from '../components/ui/PhotoBackdrop'
import useLiteMotion from '../hooks/useLiteMotion'
import PageWrapper from '../components/layout/PageWrapper'


const fade = (delay, reduced) =>
  reduced ? { duration: 0 } : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }

const PACKAGES = [
  { key: 'package1', icon: Palette },
  { key: 'package2', icon: Target },
]

const FEATURED = { key: 'package3', icon: Layers }

const SectionAccent = () => (
  <div className="flex items-center gap-3 mb-5 justify-center" aria-hidden="true">
    <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary-cyan/50" />
    <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />
    <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary-cyan/50" />
  </div>
)

/* ─── Floating orb used in both hero and packages ──────────── */
function Orb({ style, animate, transition }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={animate}
      transition={transition}
    />
  )
}

export default function Services() {
  const { t } = useTranslation()
  const lite = useLiteMotion()
  // On mobile, entrance animations render final-state instantly: staggered
  // reveals on a phone read as slow loading, not polish.
  const reduced = useReducedMotion() || lite
  const heroRef = useRef(null)
  // Blur-filtered orbs + repeat-Infinity animations are too expensive on mobile GPU.
  // Detect once on mount; SSR-safe.
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  )

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('services.seo.title')}</title>
        <meta name="description" content={t('services.seo.description')} />
        <meta property="og:title" content={t('services.seo.title')} />
        <meta property="og:description" content={t('services.seo.description')} />
        <link rel="canonical" href="https://navaraagency.com/services" />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center overflow-hidden bg-primary-dark-blue pt-32 pb-24"
        aria-label="Services hero"
      >
        {/* Static abstract backdrop */}
        <PhotoBackdrop src="/brand/AbstractBG/ab2.jpg" opacity={0.13} sectionRef={heroRef} />

        {/* Base gradient overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(155deg, rgba(6,0,120,0.92) 0%, rgba(4,0,78,0.88) 55%, rgba(26,10,110,0.92) 100%)' }} />

        {/* ── Continuous hero animations ── */}

        {/* Pulsing concentric rings around the content */}
        {!lite && !isMobile && [0, 1, 2].map(i => (
          <motion.div key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280 + i * 160,
              height: 280 + i * 160,
              top: '50%', left: '50%',
              x: '-50%', y: '-50%',
              border: '1px solid rgba(3,201,224,0.12)',
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay: i * 1.6 }}
          />
        ))}

        {/* Floating orbs + shimmer — desktop only (blur filters are too costly on mobile) */}
        {!isMobile && <>
        <Orb
          style={{
            top: '8%', right: '12%', width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(3,201,224,0.13) 0%, transparent 70%)',
            filter: 'blur(65px)',
          }}
          animate={lite ? {} : { y: [0, -28, 0], x: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Orb
          style={{
            bottom: '5%', left: '6%', width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(82,55,159,0.18) 0%, transparent 70%)',
            filter: 'blur(55px)',
          }}
          animate={lite ? {} : { y: [0, 22, 0], x: [0, -14, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <Orb
          style={{
            top: '40%', left: '3%', width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(255,165,205,0.1) 0%, transparent 70%)',
            filter: 'blur(45px)',
          }}
          animate={lite ? {} : { y: [0, -18, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        </>}

        {/* Diagonal shimmer sweep */}
        {!lite && !isMobile && (
          <motion.div aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              width: 3, height: '220%', top: '-60%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(3,201,224,0.18) 50%, transparent 100%)',
              rotate: 30, transformOrigin: 'center',
            }}
            animate={{ left: ['-10%', '115%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5.5, ease: 'easeInOut' }}
          />
        )}

        {/* Floating micro-particles */}
        {!lite && !isMobile && [
          { cx: '18%', cy: '30%', color: 'rgba(3,201,224,0.7)', size: 3, dur: 4.5, delay: 0 },
          { cx: '35%', cy: '65%', color: 'rgba(82,55,159,0.6)', size: 2, dur: 6, delay: 1 },
          { cx: '55%', cy: '25%', color: 'rgba(255,165,205,0.6)', size: 2.5, dur: 5, delay: 0.8 },
          { cx: '72%', cy: '70%', color: 'rgba(3,201,224,0.5)', size: 2, dur: 7, delay: 2 },
          { cx: '85%', cy: '40%', color: 'rgba(82,55,159,0.7)', size: 3, dur: 5.5, delay: 1.5 },
        ].map((p, i) => (
          <motion.span key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{ left: p.cx, top: p.cy, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -(16 + i * 5), 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <motion.p className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-5"
            style={{ fontSize: '0.8rem' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.2, reduced)}>
            {t('nav.links.services')}
          </motion.p>
          <motion.h1 className="font-handicrafts font-black text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.15 }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.35, reduced)}>
            {t('services.hero.h1')}
          </motion.h1>
          <motion.p className="font-somar text-white/65 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.5, reduced)}>
            {t('services.hero.body')}
          </motion.p>
        </div>
      </section>

      {/* ── Three Packages ───────────────────────────────────── */}
      {/*
        Raw section (not the Section component) so we control the background fully.
        Violet-tinted gradient surface + animated blobs fill the entire section area,
        no image parallax gaps.
      */}
      <section className="relative py-24 overflow-hidden" aria-label="Service packages"
        style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f0ebff 40%, #f5f8ff 70%, #ece6ff 100%)' }}>

        {/* Animated blobs — desktop only */}
        {!isMobile && <>
        <Orb
          style={{
            top: '-10%', right: '-5%', width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(82,55,159,0.09) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
          animate={lite ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Orb
          style={{
            bottom: '-8%', left: '-4%', width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(3,201,224,0.07) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={lite ? {} : { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <Orb
          style={{
            top: '40%', left: '45%', width: 350, height: 350,
            background: 'radial-gradient(circle, rgba(82,55,159,0.06) 0%, transparent 70%)',
            filter: 'blur(70px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={lite ? {} : { scale: [1, 1.15, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        </>}

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
          <FadeUp>
            <SectionAccent />
            <p className="font-somar text-xs font-semibold uppercase tracking-[0.2em] text-primary-cyan text-center mb-3">
              {t('services.packages.eyebrow')}
            </p>
            <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-14"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('services.packages.h2')}
            </h2>
          </FadeUp>

          {/* Top two standard packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {PACKAGES.map(({ key, icon: Icon }, i) => (
              <FadeUp key={key} delay={i * 0.1}>
                <motion.div
                  className="relative rounded-2xl p-8 h-full flex flex-col overflow-hidden group"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: lite ? 'none' : 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(82,55,159,0.07)' }}
                  whileHover={reduced ? {} : { y: -6, boxShadow: '0 16px 48px rgba(82,55,159,0.13)' }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Gradient top accent */}
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />

                  {/* Hover glow */}
                  <div aria-hidden="true"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(82,55,159,0.07) 0%, transparent 65%)' }} />

                  {/* Ghost number watermark */}
                  <span aria-hidden="true"
                    className="absolute bottom-3 end-5 font-handicrafts font-black select-none pointer-events-none"
                    style={{ fontSize: '6rem', lineHeight: 1, color: 'rgba(82,55,159,0.06)' }}>
                    0{i + 1}
                  </span>

                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 relative z-10 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.16) 0%, rgba(82,55,159,0.14) 100%)', border: '1px solid rgba(82,55,159,0.25)' }}>
                    <Icon size={20} className="text-primary-cyan" aria-hidden="true" />
                  </div>

                  <p className="font-somar text-xs italic mb-1.5 relative z-10" style={{ color: 'rgba(82,55,159,0.5)' }}>
                    {t(`services.packages.${key}.bestFor`)}
                  </p>
                  <h3 className="font-handicrafts font-bold text-primary-dark-blue mb-3 relative z-10 group-hover:text-secondary-purple transition-colors duration-300"
                    style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)' }}>
                    {t(`services.packages.${key}.name`)}
                  </h3>
                  <p className="font-somar text-sm text-text-gray leading-relaxed mb-6 relative z-10">
                    {t(`services.packages.${key}.tagline`)}
                  </p>

                  <span aria-hidden="true" className="block h-px mb-5 relative z-10"
                    style={{ background: 'linear-gradient(90deg, rgba(82,55,159,0.2), rgba(3,201,224,0.15), transparent)' }} />

                  <ul className="space-y-2.5 mt-auto relative z-10">
                    {['f1', 'f2', 'f3', 'f4'].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={13} className="text-primary-cyan mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span className="font-somar text-sm text-text-gray">{t(`services.packages.${key}.${f}`)}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* Featured package — gradient border wrapper, glassmorphism surface */}
          <FadeUp delay={0.22}>
            <div className="relative rounded-[1.2rem] p-[2px]"
              style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.65) 0%, rgba(82,55,159,0.55) 50%, rgba(3,201,224,0.45) 100%)' }}>
              <motion.div
                className="relative rounded-2xl overflow-hidden group"
                style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: lite ? 'none' : 'blur(14px)' }}
                whileHover={reduced ? {} : { y: -4, boxShadow: '0 20px 60px rgba(82,55,159,0.15)' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Ambient inner glow */}
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(82,55,159,0.06) 0%, transparent 60%)' }} />

                {/* Hover glow */}
                <div aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(3,201,224,0.08) 0%, transparent 60%)' }} />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-10">
                  {/* Left — identity */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.2) 0%, rgba(82,55,159,0.18) 100%)', border: '1px solid rgba(82,55,159,0.3)' }}>
                        <FEATURED.icon size={20} className="text-primary-cyan" aria-hidden="true" />
                      </div>
                      <span className="font-somar text-xs font-semibold text-primary-cyan rounded-full px-3 py-1"
                        style={{ background: 'rgba(82,55,159,0.08)', border: '1px solid rgba(82,55,159,0.2)' }}>
                        {t('services.packages.featuredBadge')}
                      </span>
                    </div>

                    <p className="font-somar text-xs italic mb-2" style={{ color: 'rgba(82,55,159,0.5)' }}>
                      {t(`services.packages.${FEATURED.key}.bestFor`)}
                    </p>
                    <h3 className="font-handicrafts font-bold text-primary-dark-blue mb-3 group-hover:text-secondary-purple transition-colors duration-300"
                      style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                      {t(`services.packages.${FEATURED.key}.name`)}
                    </h3>
                    <p className="font-somar text-sm text-text-gray leading-relaxed">
                      {t(`services.packages.${FEATURED.key}.tagline`)}
                    </p>
                  </div>

                  {/* Right — feature checklist */}
                  <div className="flex flex-col justify-center">
                    <span aria-hidden="true" className="block lg:hidden h-px mb-6"
                      style={{ background: 'linear-gradient(90deg, rgba(82,55,159,0.2), rgba(3,201,224,0.15), transparent)' }} />
                    <ul className="space-y-3">
                      {['f1', 'f2', 'f3', 'f4'].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check size={15} className="text-primary-cyan mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="font-somar text-sm text-text-gray">{t(`services.packages.${FEATURED.key}.${f}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ghost watermark */}
                <span aria-hidden="true"
                  className="absolute bottom-2 end-6 font-handicrafts font-black select-none pointer-events-none"
                  style={{ fontSize: '8rem', lineHeight: 1, color: 'rgba(82,55,159,0.05)' }}>
                  03
                </span>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Philosophy note ──────────────────────────────────── */}
      <Section variant="light" backdrop={
        <>
          <div aria-hidden="true" className="absolute -top-20 -end-20 w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.055) 0%, transparent 70%)', filter: 'blur(90px)' }} />
          <div aria-hidden="true" className="absolute -bottom-20 -start-20 w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </>
      }>
        <FadeUp>
          <div className="text-center max-w-2xl mx-auto">
            <SectionAccent />
            <p className="font-somar text-text-gray/80 leading-relaxed italic"
              style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}>
              {t('services.philosophy.note')}
            </p>
          </div>
        </FadeUp>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTABanner headingKey="services.cta.h2" backdrop="/brand/AbstractBG/ab4.webp" />
    </PageWrapper>
  )
}
