import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'

export default function IndustryCard({ titleKey, bodyKey, icon: Icon, glowDelay = 0 }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()

  return (
    <motion.div
      className="relative rounded-2xl p-8 h-full overflow-hidden group cursor-default"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 16px rgba(82,55,159,0.06)' }}
      whileHover={reduced ? {} : { y: -8, boxShadow: '0 16px 48px rgba(3,201,224,0.13)' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Shimmer running along top accent bar */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] overflow-hidden pointer-events-none">
        <div className="h-full w-full"
          style={{ background: 'linear-gradient(90deg, #03c9e0 0%, #52379f 60%, transparent 100%)' }} />
        {!reduced && (
          <motion.div className="absolute top-0 h-full w-14 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
            animate={{ left: ['-20%', '120%'] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut', delay: glowDelay }} />
        )}
      </div>

      {/* Hover glow overlay */}
      <div aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(3,201,224,0.07) 0%, transparent 65%)' }} />

      {/* Drifting ghost icon watermark */}
      <motion.div aria-hidden="true"
        className="absolute -bottom-1 -end-1 opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{ color: 'rgba(82,55,159,1)' }}
        animate={reduced ? {} : { y: [0, -8, 0], x: [0, -4, 0] }}
        transition={{ duration: 5 + glowDelay * 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon size={84} strokeWidth={1} />
      </motion.div>

      <div className="relative z-10">
        {/* Breathing icon box */}
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.15) 0%, rgba(82,55,159,0.12) 100%)', border: '1px solid rgba(3,201,224,0.28)' }}
          animate={reduced ? {} : {
            boxShadow: [
              '0 0 0px rgba(3,201,224,0)',
              '0 0 14px rgba(3,201,224,0.25)',
              '0 0 0px rgba(3,201,224,0)',
            ],
          }}
          whileHover={reduced ? {} : { scale: 1.15, rotate: 10 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: glowDelay * 0.4 }}
        >
          <Icon size={22} className="text-primary-cyan" aria-hidden="true" />
        </motion.div>

        <h3
          className="font-handicrafts font-semibold text-primary-dark-blue mb-3 group-hover:text-secondary-purple transition-colors duration-300"
          style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)' }}
        >
          {t(titleKey)}
        </h3>
        <p className="font-somar text-text-gray text-sm leading-relaxed">{t(bodyKey)}</p>
      </div>
    </motion.div>
  )
}

IndustryCard.propTypes = {
  titleKey: PropTypes.string.isRequired,
  bodyKey: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  glowDelay: PropTypes.number,
}
