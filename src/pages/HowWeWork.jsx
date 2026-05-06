import { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { Eye, CheckSquare, Shield } from 'lucide-react'
import FadeUp from '../components/animations/FadeUp'
import ProcessStep from '../components/ui/ProcessStep'
import CTABanner from '../components/ui/CTABanner'

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

const PROCESS_STEPS = ['step1', 'step2', 'step3', 'step4', 'step5']

const BENEFITS = [
  { key: 'clarity', icon: Eye },
  { key: 'accountability', icon: CheckSquare },
  { key: 'quality', icon: Shield },
]


const FLOW_LINES = [
  { top: '30%', delay: 0,    dur: 3.8 },
  { top: '52%', delay: 1.4,  dur: 3.2 },
  { top: '72%', delay: 2.6,  dur: 4.2 },
]

const SectionAccent = () => (
  <div className="flex items-center gap-3 mb-5 justify-center" aria-hidden="true">
    <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(3,201,224,0.5))' }} />
    <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />
    <span className="h-px w-8" style={{ background: 'linear-gradient(270deg, transparent, rgba(3,201,224,0.5))' }} />
  </div>
)

export default function HowWeWork() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const processRef = useRef(null)
  const videoRef = useRef(null)
  // Start at 0 — bumped to 0.42 once the video has buffered enough to play smoothly.
  const [vidOpacity, setVidOpacity] = useState(0)

  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return
    let fading = false
    const onTime = () => {
      if (!v.duration) return
      if (!fading && v.currentTime >= v.duration - 1) {
        fading = true
        setVidOpacity(0)
      } else if (fading && v.currentTime < 0.5) {
        fading = false
        setVidOpacity(0.42)
      }
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [reduced])

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('howWeWork.seo.title')}</title>
        <meta name="description" content={t('howWeWork.seo.description')} />
        <meta property="og:title" content={t('howWeWork.seo.title')} />
        <meta property="og:description" content={t('howWeWork.seo.description')} />
        <link rel="canonical" href="https://navaraagency.com/how-we-work" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[82vh] flex items-center overflow-hidden bg-primary-dark-blue pt-32 pb-28"
        aria-label="How we work hero"
      >
        {/* Poster image — visible until the video has buffered enough to play smoothly.
            Prevents the "frozen first frame" / "blue cast only" flash on slow networks. */}
        <img aria-hidden="true" src="/brand/hero-how-poster.jpg" alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.42 }} />
        {/* Video — fades in once canplay fires, then loops with the existing end-of-clip fade. */}
        <video ref={videoRef} aria-hidden="true" autoPlay loop muted playsInline
          preload="auto"
          poster="/brand/hero-how-poster.jpg"
          onCanPlay={() => setVidOpacity(0.42)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: vidOpacity, transition: 'opacity 0.8s ease' }}>
          <source src="/brand/HOWWEWORK.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(155deg, rgba(6,0,120,0.88) 0%, rgba(4,0,78,0.84) 55%, rgba(20,5,100,0.88) 100%)' }} />

        {/* Radial glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(3,201,224,0.12) 0%, transparent 55%)' }} />

        {/* Radar rings */}
        {!reduced && [0, 1, 2].map(i => (
          <motion.div key={i} aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              width: 240 + i * 200,
              height: 240 + i * 200,
              border: '1px solid rgba(3,201,224,0.07)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ duration: 4 + i * 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 1.4 }}
          />
        ))}

        {/* Horizontal data-flow streaks */}
        {!reduced && FLOW_LINES.map(({ top, delay, dur }) => (
          <div key={top} aria-hidden="true"
            className="absolute inset-x-0 pointer-events-none overflow-hidden"
            style={{ top, height: '1px' }}>
            <motion.div
              className="absolute inset-y-0 w-1/4"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(3,201,224,0.32), rgba(82,55,159,0.22), transparent)' }}
              animate={{ left: ['-25%', '115%'] }}
              transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay }}
            />
          </div>
        ))}

        {/* Particles */}
        {!reduced && [...Array(9)].map((_, i) => (
          <motion.div key={i} aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${8 + i * 10}%`,
              top: `${18 + (i % 5) * 14}%`,
              background: i % 2 === 0 ? 'rgba(3,201,224,0.55)' : 'rgba(82,55,159,0.45)',
            }}
            animate={{ y: [0, -18, 0], opacity: [0.25, 0.85, 0.25] }}
            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45 }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <motion.p
            className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-5"
            style={{ fontSize: '0.8rem' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.2, reduced)}>
            {t('nav.links.howWeWork')}
          </motion.p>
          <motion.h1
            className="font-handicrafts font-black text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.15 }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.35, reduced)}>
            {t('howWeWork.hero.h1')}
          </motion.h1>
          <motion.p
            className="font-somar text-white/65 max-w-2xl mx-auto leading-relaxed mb-12"
            style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.5, reduced)}>
            {t('howWeWork.hero.body')}
          </motion.p>

          {/* Animated step-indicator row */}
          {!reduced && (
            <motion.div
              className="flex items-center justify-center gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.65, reduced)}
            >
              {PROCESS_STEPS.map((_, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(3,201,224,0.10)', border: '1px solid rgba(3,201,224,0.28)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(3,201,224,0)', '0 0 10px rgba(3,201,224,0.4)', '0 0 0px rgba(3,201,224,0)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <span className="font-handicrafts font-bold text-primary-cyan" style={{ fontSize: '0.72rem' }}>{i + 1}</span>
                  </motion.div>
                  {i < 4 && (
                    <div className="relative h-px w-5 sm:w-8 overflow-hidden"
                      style={{ background: 'rgba(3,201,224,0.15)' }}>
                      <motion.div
                        className="absolute inset-y-0 w-full"
                        style={{ background: 'rgba(3,201,224,0.7)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: i * 0.28 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Five-Step Process ──────────────────────────────────────── */}
      <section ref={processRef} className="relative overflow-hidden py-28">
        {/* Violet gradient bg */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f0ebff 40%, #f5f8ff 70%, #ece6ff 100%)' }} />

        {/* Dot-grid texture */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(82,55,159,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Animated atmosphere blobs */}
        {!reduced && (
          <>
            <motion.div aria-hidden="true"
              className="absolute -top-32 -start-24 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.09) 0%, transparent 70%)', filter: 'blur(80px)' }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div aria-hidden="true"
              className="absolute -bottom-24 -end-20 w-[420px] h-[420px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.1) 0%, transparent 70%)', filter: 'blur(75px)' }}
              animate={{ scale: [1, 1.22, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
            <motion.div aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.05) 0%, transparent 70%)', filter: 'blur(65px)' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
          </>
        )}

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8">
          <FadeUp>
            <SectionAccent />
            <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-16"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('howWeWork.process.h2')}
            </h2>
          </FadeUp>

          {/* Steps + flow-pulse overlay */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 relative">
              {PROCESS_STEPS.map((key, i) => (
                <ProcessStep
                  key={key}
                  number={t(`howWeWork.process.${key}.number`)}
                  titleKey={`howWeWork.process.${key}.title`}
                  bodyKey={`howWeWork.process.${key}.body`}
                  isLast={i === PROCESS_STEPS.length - 1}
                  animationDelay={i * 0.18}
                />
              ))}
            </div>

            {/* Glowing dot traveling along the connector path */}
            {!reduced && (
              <div aria-hidden="true"
                className="absolute pointer-events-none hidden lg:block"
                style={{ top: '3rem', left: '5%', right: '5%', height: '2px' }}>
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ background: '#03c9e0', boxShadow: '0 0 8px rgba(3,201,224,0.9), 0 0 20px rgba(3,201,224,0.5), 0 0 40px rgba(3,201,224,0.25)' }}
                  animate={{ left: ['-1%', '101%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── What This Means for Clients ───────────────────────────── */}
      <section className="relative overflow-hidden py-28 bg-white">
        {/* Animated blobs */}
        {!reduced && (
          <>
            <motion.div aria-hidden="true"
              className="absolute -top-20 -end-20 w-[480px] h-[480px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(82,55,159,0.06) 0%, transparent 70%)', filter: 'blur(90px)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div aria-hidden="true"
              className="absolute -bottom-20 -start-20 w-[380px] h-[380px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.055) 0%, transparent 70%)', filter: 'blur(80px)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </>
        )}

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8">
          <FadeUp>
            <SectionAccent />
            <h2 className="font-handicrafts font-bold text-primary-dark-blue text-center mb-12"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
              {t('howWeWork.benefits.h2')}
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {BENEFITS.map(({ key, icon: Icon }, i) => (
              <motion.div key={key}
                initial={reduced ? {} : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
              >
                <motion.div
                  className="relative bg-white border border-gray-100 rounded-2xl p-8 text-center overflow-hidden group shadow-sm h-full"
                  whileHover={reduced ? {} : { y: -8, boxShadow: '0 16px 48px rgba(82,55,159,0.1)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Top accent bar + shimmer */}
                  <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] overflow-hidden pointer-events-none">
                    <div className="h-full w-full"
                      style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
                    {!reduced && (
                      <motion.div className="absolute top-0 h-full w-14 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)' }}
                        animate={{ left: ['-20%', '120%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut', delay: i * 1.2 }} />
                    )}
                  </div>

                  {/* Hover glow */}
                  <div aria-hidden="true"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(82,55,159,0.06) 0%, transparent 65%)' }} />

                  {/* Ghost icon drift */}
                  <motion.div aria-hidden="true"
                    className="absolute -bottom-2 -end-2 opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-500"
                    style={{ color: 'rgba(82,55,159,1)' }}
                    animate={reduced ? {} : { y: [0, -10, 0], x: [0, -5, 0] }}
                    transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Icon size={80} strokeWidth={1} />
                  </motion.div>

                  <div className="relative z-10">
                    {/* Radar-sweep icon box */}
                    <div className="relative w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 overflow-hidden group-hover:scale-110 transition-transform duration-300"
                      style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.14) 0%, rgba(82,55,159,0.1) 100%)', border: '1px solid rgba(3,201,224,0.25)' }}>
                      {!reduced && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{ background: 'conic-gradient(from 0deg, rgba(3,201,224,0.28), transparent 50%)' }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: i * 0.9 }}
                        />
                      )}
                      <Icon size={22} className="text-primary-cyan relative z-10" aria-hidden="true" />
                    </div>
                    <h3 className="font-handicrafts font-semibold text-primary-dark-blue text-lg mb-2 group-hover:text-secondary-purple transition-colors duration-300">
                      {t(`howWeWork.benefits.${key}.title`)}
                    </h3>
                    <p className="font-somar text-text-gray text-sm leading-relaxed">
                      {t(`howWeWork.benefits.${key}.body`)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing Note ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 bg-navara-light">
        <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-8 text-center">
          <FadeUp>
            <motion.div
              className="font-handicrafts font-black leading-none mb-2 select-none"
              style={{ fontSize: '5rem', color: 'rgba(6,0,120,0.12)' }}
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >&ldquo;</motion.div>

            <p className="font-handicrafts font-medium text-primary-dark-blue italic"
              style={{ fontSize: 'clamp(1.05rem, 2vw, 1.35rem)', lineHeight: 1.65 }}>
              {t('howWeWork.closing')}
            </p>

            <div className="flex items-center justify-center gap-3 mt-8" aria-hidden="true">
              <motion.div
                className="h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(6,0,120,0.25))', width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-primary-cyan"
                animate={reduced ? {} : { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="h-px"
                style={{ background: 'linear-gradient(270deg, transparent, rgba(6,0,120,0.25))', width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <CTABanner headingKey="howWeWork.cta.h2" backdrop="/brand/AbstractBG/ab1.webp" />
    </PageWrapper>
  )
}
