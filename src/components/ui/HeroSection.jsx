import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LiquidButton from './LiquidButton'

const fade = (delay, reduced) =>
  reduced ? { duration: 0 } : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }

const highlightStyle = {
  backgroundImage: 'linear-gradient(135deg, #21D3FB 0%, #B5F1FE 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function renderH1Line(text) {
  const parts = text.split(/(\+30%|90 Days|30٪|90 يوم)/g)
  return parts.map((part, i) =>
    /^\+30%$|^30٪$|^90 Days$|^90 يوم$/.test(part)
      ? <span key={i} style={highlightStyle}>{part}</span>
      : part
  )
}

export default function HeroSection({ onCtaClick }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)
  // Skip the background video on mobile — the 2.4 MB download causes the most
  // noticeable lag on small devices. The poster image stays visible instead.
  const [showVideo] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768
  )

  const navigate = useNavigate()
  const handleCta = onCtaClick ?? (() => navigate('/contact#contact-form'))

  return (
    <section
      id="hero"
      className="relative flex items-center overflow-hidden bg-primary-dark-blue"
      aria-label="Hero"
    >
      {/* Poster image — visible until video has buffered enough to play smoothly.
          Prevents the "frozen first frame" / "blue cast only" flash on slow networks. */}
      <img
        aria-hidden="true"
        src="/brand/hero-home-poster.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      {/* Background video — desktop only; skipped on mobile to avoid downloading 2.4 MB */}
      {showVideo && (
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/brand/hero-home-poster.jpg"
          onCanPlay={() => setVideoReady(true)}
          style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 0.6s ease' }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/brand/Animate_this_photo.mp4" type="video/mp4" />
        </video>
      )}

      {/* Overlay — matches services section palette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(155deg, rgba(43, 14, 116,0.92) 0%, rgba(26, 6, 72,0.88) 55%, rgba(43, 14, 116,0.92) 100%)',
        }}
      />
      {/* Secondary blue tint */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 60% 40%, rgba(138, 11, 230,0.18) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 pt-28 pb-12 md:pt-40 md:pb-24 text-center">

        {/* H1 — 3 lines. No opacity animation so Chrome can record LCP immediately */}
        <motion.h1
          className="font-handicrafts font-black text-white mb-8 md:mb-10"
          style={{ fontSize: 'clamp(2.2rem, 4.2vw, 2.8rem)', lineHeight: 1.3, letterSpacing: '-0.01em' }}
          initial={{ y: 28 }}
          animate={{ y: 0 }}
          transition={fade(0.5, reduced)}
        >
          {t('homeV2.hero.h1').split('\n').map((line, i) => (
            <span key={i} className="block">{renderH1Line(line)}</span>
          ))}
        </motion.h1>

        {/* CTA */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fade(0.95, reduced)}
        >
          <LiquidButton onClick={handleCta}>
            {t('homeV2.hero.cta')}
          </LiquidButton>
        </motion.div>
      </div>
    </section>
  )
}
