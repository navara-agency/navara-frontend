import { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * LineShadeWrapper — decorative thin gradient lines inside a section.
 * Each line drifts horizontally on a slow staggered loop; optional
 * scroll-linked parallax when `direction` is 'up' or 'down'.
 * Purely decorative — `aria-hidden`, `pointer-events-none`.
 */

const DENSITY_COUNT_DESKTOP = { sparse: 10, normal: 20, dense: 40 }
const DENSITY_COUNT_MOBILE = { sparse: 5, normal: 10, dense: 20 }

// Sub-component so we can cleanly call useTransform per line without
// tripping the rules-of-hooks lint when lineCount changes.
function ScrollLine({ top, gradient, baseClass, direction, scrollYProgress }) {
  const range = direction === 'up' ? [20, -20] : [-20, 20]
  const y = useTransform(scrollYProgress, [0, 1], range)
  return (
    <motion.div
      className={baseClass}
      style={{ top, background: gradient, y }}
    />
  )
}

ScrollLine.propTypes = {
  top: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  baseClass: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(['up', 'down']).isRequired,
  // Framer Motion MotionValue — typed loosely.
  scrollYProgress: PropTypes.object.isRequired,
}

function DriftLine({ top, gradient, baseClass, duration, reduced }) {
  return (
    <motion.div
      className={baseClass}
      style={{ top, background: gradient }}
      animate={reduced ? undefined : { x: [-10, 10, -10] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'mirror',
      }}
    />
  )
}

DriftLine.propTypes = {
  top: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  baseClass: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  reduced: PropTypes.bool.isRequired,
}

export default function LineShadeWrapper({
  variant = 'horizontal',
  color = '#06AED5',
  direction = null,
  density = 'sparse',
}) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef(null)

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 768px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const lineCount = isDesktop
    ? DENSITY_COUNT_DESKTOP[density]
    : DENSITY_COUNT_MOBILE[density]

  const baseClass =
    variant === 'diagonal'
      ? 'absolute w-[120%] -left-[10%] h-px rotate-[15deg]'
      : 'absolute w-full h-px'

  const gradient = `linear-gradient(to right, transparent 0%, ${color}66 50%, transparent 100%)`

  // Always call useScroll (hooks must run unconditionally). When direction
  // isn't set, the return value is ignored.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const scrollLinked = direction === 'up' || direction === 'down'

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden="true"
    >
      {Array.from({ length: lineCount }).map((_, i) => {
        const top = `${(i / lineCount) * 100}%`
        const duration = 10 + (i % 5)

        if (scrollLinked && !shouldReduceMotion) {
          return (
            <ScrollLine
              key={i}
              top={top}
              gradient={gradient}
              baseClass={baseClass}
              direction={direction}
              scrollYProgress={scrollYProgress}
            />
          )
        }

        return (
          <DriftLine
            key={i}
            top={top}
            gradient={gradient}
            baseClass={baseClass}
            duration={duration}
            reduced={shouldReduceMotion}
          />
        )
      })}
    </div>
  )
}

LineShadeWrapper.propTypes = {
  variant: PropTypes.oneOf(['horizontal', 'diagonal']),
  color: PropTypes.string,
  direction: PropTypes.oneOf(['up', 'down']),
  density: PropTypes.oneOf(['sparse', 'normal', 'dense']),
}
