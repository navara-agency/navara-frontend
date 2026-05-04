import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import FadeUp from '../animations/FadeUp'

export default function ServiceCard({ titleKey, bodyKey, icon: Icon, number, animationDelay = 0 }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <FadeUp delay={animationDelay} className="h-full">
      <motion.div
        className="relative rounded-2xl p-8 h-full group overflow-hidden cursor-default flex flex-col"
        style={{ background: 'linear-gradient(135deg, #001192 0%, #000B60 100%)' }}
        whileHover={shouldReduceMotion ? {} : { y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top accent line — turquoise at rest, orange on hover */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] transition-all duration-500"
          style={{
            background: 'linear-gradient(90deg, #06AED5 0%, #06AED5 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, #FB6107 0%, #FB6107 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Radial spotlight — appears on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 20%, rgba(6,174,213,0.14) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* Number watermark */}
        {number !== undefined && (
          <span
            className="absolute -top-2 end-4 font-glancyr font-bold select-none pointer-events-none transition-colors duration-500 text-white/[0.05] group-hover:text-navara-orange/20"
            style={{ fontSize: 'clamp(5rem, 9vw, 8rem)', lineHeight: 1 }}
            aria-hidden="true"
          >
            {String(number).padStart(2, '0')}
          </span>
        )}

        {/* Icon watermark */}
        <div
          className="absolute -bottom-3 -end-3 pointer-events-none transition-all duration-500 text-white/[0.04] group-hover:text-navara-turquoise/10 group-hover:scale-110"
          aria-hidden="true"
        >
          <Icon size={120} />
        </div>

        {/* Icon badge */}
        <div className="relative z-10 mb-6 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-400 bg-navara-turquoise/10 border border-navara-turquoise/25 group-hover:bg-navara-orange/15 group-hover:border-navara-orange/35">
          <Icon
            size={20}
            className="text-navara-turquoise group-hover:text-navara-orange transition-colors duration-400"
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h3
          className="relative z-10 font-glancyr font-semibold text-white mb-3 leading-snug"
          style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)' }}
        >
          {t(titleKey)}
        </h3>

        {/* Body */}
        <p className="relative z-10 font-sherika text-white/55 text-sm leading-relaxed group-hover:text-white/72 transition-colors duration-300 flex-1">
          {t(bodyKey)}
        </p>

        {/* Bottom rule + arrow */}
        <div className="relative z-10 mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10 group-hover:bg-navara-orange/30 transition-colors duration-500" />
          <ArrowRight
            size={14}
            className="text-white/20 group-hover:text-navara-orange transition-colors duration-500"
            aria-hidden="true"
          />
        </div>
      </motion.div>
    </FadeUp>
  )
}
