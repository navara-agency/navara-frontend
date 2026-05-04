import { motion, useReducedMotion } from 'framer-motion'

/**
 * Reusable scroll-triggered fade-up animation wrapper.
 * Respects prefers-reduced-motion: collapses all motion to instant state.
 */
export default function FadeUp({ children, delay = 0, className = '', once = true }) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: 'easeOut',
        delay: shouldReduceMotion ? 0 : delay,
      }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
