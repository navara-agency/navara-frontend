import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * HeroWaveBackdrop — clean ambient orb composition for the home hero.
 * Three blurred orbs provide depth without visual noise.
 * When `reduced` is true, orbs render static.
 */
export default function HeroWaveBackdrop({ reduced = false }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      <motion.div
        className="absolute -top-40 -right-40 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] rounded-full blur-[80px] lg:blur-[120px]"
        style={{ backgroundColor: 'rgba(6,174,213,0.25)' }}
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[200px] h-[200px] lg:w-[400px] lg:h-[400px] rounded-full blur-[60px] lg:blur-[100px]"
        style={{ backgroundColor: 'rgba(251,97,7,0.18)' }}
        animate={reduced ? undefined : { x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] rounded-full blur-[50px] lg:blur-[80px]"
        style={{ backgroundColor: 'rgba(0,17,146,0.5)' }}
        animate={reduced ? undefined : { scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  )
}

HeroWaveBackdrop.propTypes = {
  reduced: PropTypes.bool,
}

HeroWaveBackdrop.propTypes = {
  reduced: PropTypes.bool,
}
