import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import useLiteMotion from '../../hooks/useLiteMotion'

function renderEmphasis(text, reduced) {
  const parts = text.split(/(90 days|90 يوم|completely free|مجانًا تمامًا)/g)
  return parts.map((part, i) => {
    if (/^(90 days|90 يوم)$/.test(part))
      return (
        <motion.span
          key={i}
          className="font-handicrafts font-bold text-primary-cyan"
          animate={reduced ? {} : {
            textShadow: [
              '0 0 0px rgba(3,201,224,0)',
              '0 0 14px rgba(3,201,224,0.9)',
              '0 0 0px rgba(3,201,224,0)',
            ],
          }}
          transition={reduced ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          {part}
        </motion.span>
      )
    if (/^(completely free|مجانًا تمامًا)$/.test(part))
      return (
        <motion.span
          key={i}
          className="font-somar font-bold text-primary-cyan"
          animate={reduced ? {} : {
            textShadow: [
              '0 0 0px rgba(3,201,224,0)',
              '0 0 14px rgba(3,201,224,0.9)',
              '0 0 0px rgba(3,201,224,0)',
            ],
          }}
          transition={reduced ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
        >
          {part}
        </motion.span>
      )
    return part
  })
}


function BackgroundOrb({ cx, cy, size, color, duration, parallaxY, reduced }) {
  if (reduced) return null
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={{
        left: cx,
        top: cy,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        x: '-50%',
        y: parallaxY,
      }}
      animate={{ x: ['-50%', 'calc(-50% + 24px)', 'calc(-50% - 16px)', '-50%'], opacity: [0.55, 0.75, 0.55] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function GlowDivider({ reduced }) {
  const pingTransition = { duration: 2.2, repeat: Infinity, ease: 'easeOut', repeatDelay: 1.6 }
  const lineTransition = { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }

  return (
    <motion.div
      className="relative flex items-center mb-10"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0 }}
      whileInView={reduced ? false : { opacity: 1 }}
      viewport={{ once: true }}
      transition={reduced ? { duration: 0 } : { duration: 0.6 }}
    >
      {/* Left line — ping travels right → left (from dot outward) */}
      <div className="relative flex-1 h-px overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to left, rgba(3,201,224,0.45), transparent)' }}
          animate={reduced ? {} : { opacity: [0.35, 0.7, 0.35] }}
          transition={reduced ? {} : lineTransition}
        />
        {!reduced && (
          <motion.div
            className="absolute inset-y-0 w-16"
            style={{
              right: 0,
              background: 'linear-gradient(90deg, transparent, rgba(3,201,224,0.85), transparent)',
            }}
            animate={{ x: [0, '-550%'], opacity: [1, 0] }}
            transition={pingTransition}
          />
        )}
      </div>

      {/* Center dot — continuous pulse */}
      <motion.div
        className="mx-3 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: '#03c9e0' }}
        animate={reduced ? {} : {
          boxShadow: [
            '0 0 5px 2px rgba(3,201,224,0.45)',
            '0 0 20px 8px rgba(3,201,224,0.95)',
            '0 0 5px 2px rgba(3,201,224,0.45)',
          ],
          scale: [1, 1.5, 1],
        }}
        transition={reduced ? {} : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Right line — ping travels left → right (from dot outward) */}
      <div className="relative flex-1 h-px overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(3,201,224,0.45), transparent)' }}
          animate={reduced ? {} : { opacity: [0.35, 0.7, 0.35] }}
          transition={reduced ? {} : lineTransition}
        />
        {!reduced && (
          <motion.div
            className="absolute inset-y-0 w-16"
            style={{
              left: 0,
              background: 'linear-gradient(90deg, transparent, rgba(3,201,224,0.85), transparent)',
            }}
            animate={{ x: [0, '550%'], opacity: [1, 0] }}
            transition={pingTransition}
          />
        )}
      </div>
    </motion.div>
  )
}

export default function RiskReversal({ onCtaClick }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  // Decorative infinite animations (orbs, glow pulses, shine) are disabled on
  // mobile via `lite`; entrance animations stay tied to `reduced`.
  const lite = useLiteMotion()
  const navigate = useNavigate()
  const handleCta = onCtaClick ?? (() => navigate('/contact#contact-form'))

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const orb1Y = useTransform(scrollYProgress, [0, 1], ['-80px', '80px'])
  const orb2Y = useTransform(scrollYProgress, [0, 1], ['60px', '-60px'])
  const orb3Y = useTransform(scrollYProgress, [0, 1], ['-40px', '50px'])

  return (
    <section
      ref={sectionRef}
      id="risk-reversal"
      className="relative bg-primary-dark-blue py-28 overflow-hidden"
      aria-label="Risk reversal guarantee"
    >
      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/brand/risk-reversal-bg.webp')",
          opacity: 0.12,
        }}
      />

      {/* Scroll-parallax orbs */}
      <BackgroundOrb cx="10%" cy="20%" size={420} color="rgba(3,201,224,0.18)" duration={11} parallaxY={orb1Y} reduced={lite} />
      <BackgroundOrb cx="88%" cy="65%" size={380} color="rgba(82,55,159,0.22)" duration={14} parallaxY={orb2Y} reduced={lite} />
      <BackgroundOrb cx="55%" cy="90%" size={300} color="rgba(3,201,224,0.12)" duration={9}  parallaxY={orb3Y} reduced={lite} />

      <div className="relative z-10">

        {/* Title — wider track so the larger font stays on one line */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 mb-10">
          <motion.h2
            className="font-handicrafts font-black text-center whitespace-nowrap"
            style={{
              fontSize: 'clamp(1.1rem, 4.2vw, 3.4rem)',
              lineHeight: 1.2,
              background: 'linear-gradient(105deg, #ffffff 15%, #03c9e0 35%, rgba(255,255,255,0.96) 48%, #03c9e0 62%, #ffffff 82%)',
              backgroundSize: '250% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: lite ? 'none' : 'headingShine 5s linear infinite',
            }}
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={reduced ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('homeV2.riskReversal.sectionHeading')}
          </motion.h2>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="max-w-[760px] mx-auto">

          {/* Body paragraphs — blur-slide-in with stagger */}
          <div className="flex flex-col gap-4 mb-12">
            {['para1', 'para2', 'para3'].map((key, i) => (
              <motion.p
                key={key}
                initial={reduced ? false : { opacity: 0, x: -24, filter: 'blur(6px)' }}
                whileInView={reduced ? false : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="font-somar text-white/80 leading-relaxed border-s-2 border-primary-cyan/50 ps-4"
                style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)' }}
              >
                {t(`homeV2.riskReversal.primary.${key}`)}
              </motion.p>
            ))}
          </div>

          {/* Divider draws from center */}
          <GlowDivider reduced={lite} />

          {/* Subheading */}
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={reduced ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-somar font-bold text-white uppercase tracking-[0.12em] text-center mb-8"
            style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}
          >
            {t('homeV2.riskReversal.guarantee.heading')}
          </motion.p>

          {/* Guarantee card — enters then border breathes */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={reduced ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={reduced ? { duration: 0 } : { duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            animate={lite ? {} : {
              boxShadow: [
                '0 0 30px rgba(3,201,224,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
                '0 0 55px rgba(3,201,224,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
                '0 0 30px rgba(3,201,224,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
              ],
            }}
            transition={reduced ? { duration: 0 } : {
              boxShadow: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
              opacity: { duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
            }}
            className="rounded-2xl p-7 mb-14"
            style={{
              background: 'linear-gradient(135deg, rgba(3,201,224,0.06) 0%, rgba(6,0,120,0.4) 100%)',
              border: '1px solid rgba(3,201,224,0.22)',
            }}
          >
            <div className="flex flex-col gap-5">
              <p
                className="font-somar text-primary-cyan font-semibold leading-relaxed"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1rem)' }}
              >
                {t('homeV2.riskReversal.guarantee.condition')}
              </p>
              <p
                className="font-somar text-white/85 leading-relaxed"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1rem)' }}
              >
                {renderEmphasis(t('homeV2.riskReversal.guarantee.promise'), lite)}
              </p>
              <p
                className="font-somar text-white/55 italic leading-relaxed"
                style={{ fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)' }}
              >
                {t('homeV2.riskReversal.guarantee.tagline')}
              </p>
            </div>
          </motion.div>

          {/* Badge + CTA — badge is a rectangle that peeks from behind the button on hover */}
          <motion.div
            className="flex flex-col items-center"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={reduced ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {lite ? (
              /* Static layout for reduced-motion users and touch devices */
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleCta}
                  className="inline-flex items-center justify-center rounded-full bg-white text-primary-dark-blue font-somar font-semibold px-9 py-3 min-h-[44px] hover:bg-primary-dark-blue hover:text-white hover:ring-2 hover:ring-white transition-colors duration-300"
                  style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)', boxShadow: '0 0 24px rgba(3,201,224,0.3)' }}
                >
                  {t('homeV2.riskReversal.primary.cta')}
                </button>
                <div
                  className="px-8 py-2 font-somar font-semibold text-white text-sm rounded-b-2xl"
                  style={{ background: 'linear-gradient(135deg, #060078, #03c9e0)', letterSpacing: '0.04em' }}
                >
                  {t('homeV2.riskReversal.guarantee.badge')}
                </div>
              </div>
            ) : (
              /* Hover-animated layout */
              <motion.div
                className="relative inline-flex flex-col items-center"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                {/* Button — higher z-index so it covers the badge at rest */}
                <motion.button
                  type="button"
                  onClick={handleCta}
                  className="relative z-10 inline-flex items-center justify-center rounded-full bg-white text-primary-dark-blue font-somar font-semibold px-9 py-3 min-h-[44px] hover:bg-primary-dark-blue hover:text-white hover:ring-2 hover:ring-white transition-colors duration-300"
                  style={{
                    fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
                    boxShadow: '0 0 24px rgba(3,201,224,0.3)',
                  }}
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('homeV2.riskReversal.primary.cta')}
                </motion.button>

                {/* Rectangular badge — starts tucked behind the button, slides out below on hover */}
                <motion.div
                  className="relative z-0 -mt-px"
                  aria-hidden="true"
                  style={{ pointerEvents: 'none' }}
                  variants={{
                    rest:  { y: '-100%', opacity: 0 },
                    hover: { y: '0%',    opacity: 1 },
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                >
                  <div
                    className="flex items-center gap-2.5 px-9 py-2.5 font-somar font-semibold text-white text-sm whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(105deg, #060078 0%, #1a0a6e 40%, #03c9e0 100%)',
                      borderRadius: '0 0 18px 18px',
                      boxShadow: '0 14px 30px rgba(3,201,224,0.35), 0 4px 10px rgba(6,0,120,0.5)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span style={{ color: '#03c9e0', fontSize: '0.6rem' }}>◆</span>
                    {t('homeV2.riskReversal.guarantee.badge')}
                    <span style={{ color: '#03c9e0', fontSize: '0.6rem' }}>◆</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

        </div>
        </div>
      </div>
    </section>
  )
}
