import { motion, useReducedMotion } from 'framer-motion'
import useLiteMotion from '../../hooks/useLiteMotion'

/**
 * Reusable scroll-triggered fade-up animation wrapper.
 * Respects prefers-reduced-motion: collapses all motion to instant state.
 * On mobile (lite) the reveal is fast, undelayed, and triggers as soon as the
 * element touches the viewport — long staggered reveals read as "slow loading"
 * on small screens.
 */
export default function FadeUp({ children, delay = 0, className = '', once = true }) {
  const shouldReduceMotion = useReducedMotion()
  const lite = useLiteMotion()
  const instant = shouldReduceMotion || lite

  const variants = {
    hidden: instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: instant ? 0 : 0.6,
        ease: 'easeOut',
        delay: instant ? 0 : delay,
      }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
