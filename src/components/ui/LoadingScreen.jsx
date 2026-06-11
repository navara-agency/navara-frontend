import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import useLiteMotion from '../../hooks/useLiteMotion'

const HOLD_MS = 1600
const HOLD_MS_MOBILE = 700

export default function LoadingScreen() {
  const reduced = useReducedMotion()
  // Pulsing rings compete with page hydration for the main thread right when
  // the app is busiest — skip them on mobile. The brand hold is also shorter
  // there: mobile loads already feel slower, so don't add artificial wait.
  const lite = useLiteMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDone(true), reduced ? 0 : lite ? HOLD_MS_MOBILE : HOLD_MS)
    return () => clearTimeout(id)
  }, [reduced, lite])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #060078 0%, #04004e 55%, #140564 100%)' }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: lite ? 0.3 : 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Static ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(3,201,224,0.13) 0%, transparent 62%)' }}
            aria-hidden="true"
          />

          {/* Outer pulsing ring */}
          {!lite && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 180, height: 180, border: '1px solid rgba(3,201,224,0.18)' }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
          )}
          {!lite && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 260, height: 260, border: '1px solid rgba(82,55,159,0.12)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              aria-hidden="true"
            />
          )}

          {/* Logo icon */}
          <motion.img
            src="/brand/navara-logo-icon-white.png"
            alt="Navara"
            className="w-20 h-20 object-contain relative z-10"
            initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          />

          {/* Wordmark */}
          <motion.p
            className="font-handicrafts font-bold text-white tracking-[0.25em] mt-5 relative z-10"
            style={{ fontSize: '1rem', letterSpacing: '0.3em' }}
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          >
            NAVARA
          </motion.p>

          {/* Tagline */}
          <motion.p
            className="font-somar text-white/40 text-xs tracking-widest mt-1 relative z-10"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Growth · Clarity · Execution
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 inset-x-0 h-[2px]"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          >
            <motion.div
              className="h-full origin-left"
              style={{ background: 'linear-gradient(to right, #060078, #03c9e0, #52379f)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: (lite ? HOLD_MS_MOBILE : HOLD_MS) / 1000, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
