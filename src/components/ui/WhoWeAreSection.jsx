import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useApi } from '../../hooks/useApi'

// In-code default the card falls back to when the API is unreachable or the trustCard
// field hasn't been customised. Mirrors backend's DEFAULT_TRUST_CARD.
const FALLBACK_TRUST_CARD = {
  enabled: true,
  pillLabel: 'Navara Growth',
  metric: '+30%',
  metricCaption: 'avg. revenue increase',
  metricSubcaption: 'within first 90 days',
  stats: [
    { label: 'Clients', value: '50+' },
    { label: 'Countries', value: '3' },
    { label: 'Avg. ROAS', value: '4.2×' },
  ],
}

const stagger = (reduced) => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
})

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export default function WhoWeAreSection() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()

  const blocks = t('homeV2.whoWeAre.blocks', { returnObjects: true })

  // Trust card config from site-config — falls back to in-code defaults if API errors or
  // the trustCard field hasn't been set yet (e.g. fresh DB before first dashboard save).
  const { data: siteConfig } = useApi('/api/site-config')
  const trustCard = { ...FALLBACK_TRUST_CARD, ...(siteConfig?.trustCard || {}) }
  const trustStats = Array.isArray(trustCard.stats) && trustCard.stats.length
    ? trustCard.stats
    : FALLBACK_TRUST_CARD.stats

  return (
    <section
      id="who-we-are"
      className="relative py-20 md:py-28 overflow-hidden bg-white"
      aria-label="Who we are"
    >
      {/* Decorative blob — desktop only to avoid mobile overflow */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute -top-10 -end-20 w-[460px] h-[460px] pointer-events-none"
        style={{
          backgroundImage: "url('/brand/AbstractBG/ab3.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.06,
          borderRadius: '60% 40% 50% 70% / 50% 60% 40% 60%',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Left: animated phone-wrap frame ── */}
          {trustCard.enabled && (
          <motion.div
            className="flex-shrink-0 w-full lg:w-auto flex justify-center"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Outer wrapper — padding creates the visible border thickness */}
            <div className="relative" style={{ padding: 4 }}>

              {/* Rotating conic gradient border — disabled on mobile via CSS */}
              <div
                aria-hidden="true"
                className="absolute inset-0 frame-glow"
                style={{ borderRadius: 32 }}
              />

              {/* Ambient halo — desktop only (hidden on mobile to prevent overflow/lag) */}
              <div
                aria-hidden="true"
                className="frame-glow pointer-events-none hidden md:block"
                style={{
                  position: 'absolute',
                  inset: -18,
                  borderRadius: 50,
                  filter: 'blur(28px)',
                  opacity: 0.55,
                  zIndex: -1,
                }}
              />

              {/* Inner frame content */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: 'clamp(210px, 58vw, 300px)',
                  height: 'clamp(295px, 81vw, 420px)',
                  borderRadius: 28,
                  background: 'linear-gradient(155deg, #0e0050 0%, #060078 50%, #1a0a6e 100%)',
                }}
              >
                {/* Abstract fill */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url('/brand/AbstractBG/ab1.webp')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.35,
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Bottom gradient fade */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(6,0,120,0.2) 0%, rgba(6,0,120,0.88) 100%)' }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  {/* Logo pill */}
                  <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-white/20 bg-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" aria-hidden="true" />
                    <span className="font-somar text-white text-xs font-medium">{trustCard.pillLabel}</span>
                  </div>

                  {/* Center metric */}
                  <div className="text-center">
                    <div
                      className="font-handicrafts font-black text-white leading-none mb-2"
                      style={{
                        fontSize: 'clamp(4rem, 15vw, 5rem)',
                        backgroundImage: 'linear-gradient(135deg, #a8f0ff, #ffffff, #ffa5cd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {trustCard.metric}
                    </div>
                    <p className="font-somar text-white/70 text-sm">{trustCard.metricCaption}</p>
                    <p className="font-somar text-white/50 text-xs mt-1">{trustCard.metricSubcaption}</p>
                  </div>

                  {/* Bottom stats — admin-controlled. Show up to 4 in a single row; the
                      grid scales columns so a smaller list still looks balanced. */}
                  <div className={`grid gap-2 ${trustStats.length >= 4 ? 'grid-cols-4' : trustStats.length === 2 ? 'grid-cols-2' : trustStats.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {trustStats.slice(0, 4).map((s, idx) => (
                      <div
                        key={`${s.label}-${idx}`}
                        className="rounded-xl p-2 text-center"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="font-handicrafts font-bold text-white text-sm leading-tight">{s.value}</div>
                        <div className="font-somar text-white/50 text-[10px] leading-tight mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* ── Right: content ── */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.2em] text-sm mb-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('homeV2.whoWeAre.sectionHeading')}
            </motion.p>

            <motion.h2
              className="font-handicrafts font-bold text-primary-dark-blue mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.15 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={reduced ? { duration: 0 } : { duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('homeV2.whoWeAre.mainHeadline')}
            </motion.h2>

            <motion.div
              className="flex flex-col gap-5"
              variants={stagger(reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {blocks.map((block, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-handicrafts font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #060078, #52379f, #03c9e0)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-somar font-semibold text-primary-dark-blue leading-snug mb-1"
                      style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}
                    >
                      {block.title}
                    </h3>
                    <p
                      className="font-somar text-text-gray leading-relaxed"
                      style={{
                        fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {block.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
