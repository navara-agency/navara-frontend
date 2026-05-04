import { motion, useReducedMotion } from 'framer-motion'

export default function LiquidButton({ children, calLink, onClick, className = '' }) {
  const reduced = useReducedMotion()

  const extraProps = calLink
    ? { 'data-cal-link': calLink, 'data-cal-config': '{"layout":"month_view"}' }
    : {}

  return (
    <motion.button
      type="button"
      whileHover={reduced ? {} : { scale: 1.03, filter: 'brightness(1.1)' }}
      whileTap={reduced ? {} : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        background: 'linear-gradient(to right, #0044ff 0%, #3322cc 42%, #bb33aa 100%)',
        padding: '1.1rem 2.8rem',
        minHeight: 52,
        fontSize: 'clamp(1rem, 2vw, 1.1rem)',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 8px 32px rgba(0,50,255,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
      onClick={onClick}
      {...extraProps}
    >
      {!reduced && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', width: 240, height: 90,
            background: 'radial-gradient(ellipse at 35% 50%, rgba(160,60,230,0.95) 0%, rgba(130,40,200,0.6) 40%, transparent 70%)',
            filter: 'blur(1px)', left: -30, top: '50%', marginTop: -45,
            borderRadius: '80% 20% 70% 30% / 50% 50% 50% 50%', pointerEvents: 'none',
          }}
          animate={{
            x: [0, 80, 150, 65, 190, 80, 0], y: [0, 8, -12, 16, -6, 12, 0],
            borderRadius: ['80% 20% 70% 30% / 50% 50% 50% 50%', '30% 70% 20% 80% / 50% 50% 50% 50%', '60% 40% 80% 20% / 45% 55% 45% 55%', '80% 20% 70% 30% / 50% 50% 50% 50%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', width: 230, height: 85,
            background: 'radial-gradient(ellipse at 65% 50%, rgba(220,70,200,0.92) 0%, rgba(195,50,175,0.55) 40%, transparent 68%)',
            filter: 'blur(1px)', right: -30, top: '50%', marginTop: -42,
            borderRadius: '20% 80% 30% 70% / 50% 50% 50% 50%', pointerEvents: 'none',
          }}
          animate={{
            x: [0, -80, -150, -65, -190, -80, 0], y: [0, -8, 12, -16, 6, -12, 0],
            borderRadius: ['20% 80% 30% 70% / 50% 50% 50% 50%', '70% 30% 80% 20% / 50% 50% 50% 50%', '40% 60% 20% 80% / 55% 45% 55% 45%', '20% 80% 30% 70% / 50% 50% 50% 50%'],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
      )}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', width: 170, height: 50,
            background: 'radial-gradient(ellipse, rgba(230,185,255,0.65) 0%, rgba(210,160,255,0.28) 55%, transparent 78%)',
            filter: 'blur(1px)', left: '20%', top: '50%', marginTop: -25,
            borderRadius: '50%', pointerEvents: 'none',
          }}
          animate={{
            x: [0, 55, 115, 60, 10, -5, 0], y: [0, -6, 5, 10, 3, -5, 0],
            scaleX: [1, 1.3, 0.85, 1.2, 1], opacity: [0.75, 1, 0.55, 0.95, 0.75],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.04) 55%, transparent 100%)',
          pointerEvents: 'none', zIndex: 1,
        }}
      />
      <span
        className="font-somar font-bold text-white whitespace-nowrap"
        style={{ position: 'relative', zIndex: 2, letterSpacing: '0.01em' }}
      >
        {children}
      </span>
    </motion.button>
  )
}
