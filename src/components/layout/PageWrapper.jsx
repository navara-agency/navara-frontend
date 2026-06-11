import { motion } from 'framer-motion'
import useLiteMotion from '../../hooks/useLiteMotion'

/**
 * Route transition shell. AnimatePresence mode="wait" plays the exit and the
 * enter back-to-back, so the duration is effectively doubled per navigation —
 * keep it short on mobile where loads already feel slower.
 */
export default function PageWrapper({ children }) {
  const lite = useLiteMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: lite ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: lite ? 0 : -10 }}
      transition={{ duration: lite ? 0.18 : 0.4 }}
    >
      {children}
    </motion.div>
  )
}
