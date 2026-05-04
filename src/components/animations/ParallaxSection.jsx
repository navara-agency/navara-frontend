import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import PropTypes from 'prop-types'

export default function ParallaxSection({ children, offset = 0.15 }) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [`${offset * 100}%`, `${-offset * 100}%`])

  if (shouldReduceMotion || (typeof window !== 'undefined' && window.innerWidth <= 767)) {
    return <div ref={ref}>{children}</div>
  }

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

ParallaxSection.propTypes = {
  children: PropTypes.node.isRequired,
  offset: PropTypes.number,
}
