import { motion, useReducedMotion } from 'framer-motion'
import PropTypes from 'prop-types'

export default function RevealText({ as = 'div', children, className, delay = 0, style }) {
  const shouldReduceMotion = useReducedMotion()
  const Tag = as

  if (shouldReduceMotion) {
    return <Tag className={className} style={style}>{children}</Tag>
  }

  // motion.div wrapper (same pattern as FadeUp — reliably triggers whileInView).
  // The semantic tag is rendered inside, preserving heading hierarchy and styles.
  // Margin collapsing means the h2's mb-* classes behave the same as without the wrapper.
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Tag className={className} style={style}>
        {children}
      </Tag>
    </motion.div>
  )
}

RevealText.propTypes = {
  as: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  style: PropTypes.object,
}
