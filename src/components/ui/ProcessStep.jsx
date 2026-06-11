import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import useLiteMotion from '../../hooks/useLiteMotion'

export default function ProcessStep({ number, titleKey, bodyKey, isLast = false, animationDelay = 0 }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const lite = useLiteMotion()
  // On mobile, cards render visible immediately — see useLiteMotion
  const instant = reduced || lite

  return (
    <motion.div
      className="flex flex-col items-center text-center relative bg-white border border-gray-100 rounded-2xl px-5 py-8 shadow-sm overflow-hidden group"
      initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduced ? {} : { y: -5 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: instant ? 0 : 0.5, ease: [0.16, 1, 0.3, 1], delay: instant ? 0 : animationDelay }}
    >
      {/* Gradient top accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #03c9e0 40%, #52379f 80%, transparent 100%)' }}
      />

      {/* Background glow on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(3,201,224,0.05) 0%, transparent 70%)' }}
      />

      {/* Step number circle */}
      <div className="relative mb-5 z-10">
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(3,201,224,0.18) 0%, rgba(82,55,159,0.14) 100%)', border: '2px solid rgba(3,201,224,0.4)' }}
          animate={lite ? {} : {
            boxShadow: [
              '0 0 0px rgba(3,201,224,0)',
              '0 0 16px rgba(3,201,224,0.38)',
              '0 0 0px rgba(3,201,224,0)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: animationDelay * 0.5 }}
        >
          <span className="font-handicrafts font-bold text-primary-cyan text-xl">{number}</span>
        </motion.div>
      </div>

      {/* Desktop connector line — outside the card, bridging to next */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-[3.25rem] start-[calc(50%+2.25rem)] end-[calc(-50%+2.25rem)] h-px overflow-hidden z-20"
          aria-hidden="true"
        >
          <motion.div
            className="h-full"
            style={{
              transformOrigin: 'left center',
              background: 'linear-gradient(90deg, rgba(3,201,224,0.5), rgba(82,55,159,0.3))',
            }}
            initial={instant ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: instant ? 0 : 0.7, delay: instant ? 0 : animationDelay + 0.35 }}
          />
          {!lite && (
            <motion.div
              className="absolute top-0 h-full w-8 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)' }}
              animate={{ left: ['-15%', '115%'] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: animationDelay * 0.7 + 1.2 }}
            />
          )}
        </div>
      )}

      {/* Mobile vertical connector */}
      {!isLast && (
        <div className="lg:hidden w-px h-6 my-1 z-10 relative"
          style={{ background: 'linear-gradient(to bottom, rgba(3,201,224,0.5), rgba(82,55,159,0.3))' }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        <h3
          className="font-handicrafts font-semibold text-primary-dark-blue mb-2"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
        >
          {t(titleKey)}
        </h3>
        <p className="font-somar text-sm text-text-gray max-w-[160px] leading-relaxed mx-auto">
          {t(bodyKey)}
        </p>
      </div>
    </motion.div>
  )
}
