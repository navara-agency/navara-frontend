import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import PropTypes from 'prop-types'

export default function MagneticHover({ children, strength }) {
  const shouldReduceMotion = useReducedMotion()
  const isFineMouse = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  const ref = useRef(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 150, damping: 15, mass: 0.1 })
  const y = useSpring(rawY, { stiffness: 150, damping: 15, mass: 0.1 })

  if (shouldReduceMotion || !isFineMouse) {
    return <>{children}</>
  }

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rawX.set((e.clientX - cx) * strength)
    rawY.set((e.clientY - cy) * strength)
  }

  const handleMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

MagneticHover.propTypes = {
  children: PropTypes.node.isRequired,
  strength: PropTypes.number,
}

MagneticHover.defaultProps = {
  strength: 0.2,
}
