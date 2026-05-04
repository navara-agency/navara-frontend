import { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, useInView, useSpring } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const META = [
  {
    abstract: '/brand/AbstractBG/ab3.webp',
    accent: '#03c9e0',
    gradient: 'linear-gradient(135deg, #060078 0%, #3322cc 100%)',
  },
  {
    abstract: '/brand/AbstractBG/ab4.webp',
    accent: '#ffa5cd',
    gradient: 'linear-gradient(135deg, #3322cc 0%, #03c9e0 100%)',
  },
  {
    abstract: '/brand/AbstractBG/ab1.webp',
    accent: '#a8f0ff',
    gradient: 'linear-gradient(135deg, #060078 0%, #03c9e0 100%)',
  },
]

function CountUpNumber({ value, gradient }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setDisplay(current)
      if (current >= value) clearInterval(timer)
    }, 140)
    return () => clearInterval(timer)
  }, [inView, value, reduced])

  const shown = reduced ? (inView ? value : 0) : display

  return (
    <span
      ref={ref}
      className="font-handicrafts font-black leading-none tabular-nums"
      style={{
        fontSize: 'clamp(3rem, 5vw, 4.5rem)',
        backgroundImage: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
        minWidth: '1.8ch',
      }}
      aria-hidden="true"
    >
      {String(shown).padStart(2, '0')}
    </span>
  )
}

function TiltCard({ accent, children, reduced, ...motionProps }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [spot, setSpot] = useState({ x: 50, y: 50 })

  const rotX = useSpring(0, { stiffness: 280, damping: 26 })
  const rotY = useSpring(0, { stiffness: 280, damping: 26 })

  function onMove(e) {
    if (reduced || !ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    rotX.set(-(((e.clientY - top) / height) - 0.5) * 16)
    rotY.set((((e.clientX - left) / width) - 0.5) * 16)
    setSpot({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    })
  }

  function onLeave() {
    rotX.set(0)
    rotY.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => !reduced && setHovered(true)}
      onMouseLeave={onLeave}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${accent}${hovered ? '70' : '30'}`,
        background: 'rgba(255,255,255,0.03)',
        rotateX: reduced ? 0 : rotX,
        rotateY: reduced ? 0 : rotY,
        transformPerspective: 1000,
        boxShadow: hovered
          ? `0 24px 64px ${accent}22, 0 0 0 1px ${accent}45`
          : 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.35s ease',
        willChange: 'transform',
      }}
      {...motionProps}
    >
      {/* Mouse-tracking spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle 220px at ${spot.x}% ${spot.y}%, ${accent}1f 0%, transparent 68%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {children}
    </motion.div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function ServicesCards({ onCtaClick }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const navigate = useNavigate()

  const cards = t('homeV2.services.cards', { returnObjects: true })
  const handleCta = onCtaClick ?? (() => navigate('/contact#contact-form'))

  return (
    <section
      id="services"
      className="relative py-28 overflow-hidden"
      aria-label="Services"
      style={{ background: 'linear-gradient(155deg, #060078 0%, #0e0050 55%, #1a0a6e 100%)' }}
    >
      {/* Abstract bg texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/brand/AbstractBG/ab2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.05,
          mixBlendMode: 'luminosity',
        }}
      />
      {/* Cyan glow top-right */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -end-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(3,201,224,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8">

        {/* Header */}
        <motion.p
          className="font-somar font-semibold text-primary-cyan uppercase tracking-[0.2em] text-sm text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('homeV2.services.eyebrow')}
        </motion.p>

        <motion.h2
          className="font-handicrafts font-bold text-white text-center mb-16"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduced ? { duration: 0 } : { duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('homeV2.services.sectionHeading')}
        </motion.h2>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const meta = META[i]
            return (
              <TiltCard
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                accent={meta.accent}
                reduced={reduced}
              >
                {/* Accent top bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: meta.gradient }} />

                {/* Abstract bg */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url('${meta.abstract}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.07,
                  }}
                />

                <div className="relative z-10 flex flex-col flex-1 p-8">
                  <div className="mb-5">
                    <CountUpNumber value={i + 1} gradient={meta.gradient} />
                  </div>

                  <h3
                    className="font-somar font-bold mb-4"
                    style={{ fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', color: meta.accent }}
                  >
                    {card.title}
                  </h3>

                  <p
                    className="font-somar text-white/70 leading-relaxed flex-1 mb-8"
                    style={{ fontSize: 'clamp(0.88rem, 1.3vw, 0.97rem)' }}
                  >
                    {card.body}
                  </p>

                  <button
                    type="button"
                    onClick={handleCta}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-somar font-semibold text-white text-sm hover:opacity-90 transition-opacity self-start"
                    style={{ background: meta.gradient }}
                  >
                    {t('homeV2.services.cardCta')}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </TiltCard>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-somar text-white/50 mb-6">{t('homeV2.services.ctaText')}</p>
          <button
            type="button"
            onClick={handleCta}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-somar font-semibold text-white min-h-[44px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #060078, #3322cc, #03c9e0)' }}
          >
            {t('homeV2.services.ctaButton')}
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
