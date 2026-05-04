import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import PropTypes from 'prop-types'
import FadeUp from '../animations/FadeUp'

export default function CaseStudyCard({
  clientName,
  industry,
  outcome,
  imageUrl,
  accentColor,
  animationDelay,
}) {
  if (!imageUrl) {
    return (
      <FadeUp delay={animationDelay}>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-navara-blue to-[#001566] flex flex-col relative">
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <div className="w-14 h-14 rounded-full border border-navara-orange/30 flex items-center justify-center">
              <Plus size={24} className="text-navara-orange" aria-hidden="true" />
            </div>
            <p className="font-sherika text-xs text-white/30 tracking-wide uppercase">Coming soon</p>
          </div>
          {(clientName || industry || outcome) && (
            <div className="px-5 pb-5">
              {industry && (
                <span className="inline-block font-sherika text-xs text-navara-turquoise/60 border border-navara-turquoise/20 px-2 py-0.5 rounded-full mb-2">
                  {industry}
                </span>
              )}
              {clientName && (
                <p className="font-glancyr font-semibold text-white/40 text-sm">{clientName}</p>
              )}
              {outcome && (
                <p className="font-sherika text-xs mt-1" style={{ color: `${accentColor}60` }}>{outcome}</p>
              )}
            </div>
          )}
        </div>
      </FadeUp>
    )
  }

  return (
    <FadeUp delay={animationDelay}>
      <motion.div
        className="aspect-[4/3] rounded-2xl overflow-hidden relative group cursor-pointer"
        whileHover="hovered"
      >
        <motion.img
          src={imageUrl}
          alt={clientName || industry || 'Case study'}
          className="absolute inset-0 w-full h-full object-cover"
          variants={{ hovered: { scale: 1.03 } }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}
          variants={{ hovered: { opacity: 1.1 } }}
        />
        {/* Industry badge top-right */}
        {industry && (
          <div className="absolute top-4 right-4">
            <span className="font-sherika text-xs text-white bg-navara-turquoise/80 backdrop-blur-sm px-3 py-1 rounded-full">
              {industry}
            </span>
          </div>
        )}
        {/* Bottom text overlay */}
        <div className="absolute bottom-0 inset-x-0 p-5">
          {clientName && (
            <p className="font-glancyr font-bold text-white text-lg leading-tight mb-1">{clientName}</p>
          )}
          {outcome && (
            <p className="font-sherika text-sm font-medium" style={{ color: accentColor }}>
              {outcome}
            </p>
          )}
        </div>
      </motion.div>
    </FadeUp>
  )
}

CaseStudyCard.propTypes = {
  clientName: PropTypes.string,
  industry: PropTypes.string,
  challenge: PropTypes.string,
  outcome: PropTypes.string,
  imageUrl: PropTypes.string,
  accentColor: PropTypes.string,
  animationDelay: PropTypes.number,
}

CaseStudyCard.defaultProps = {
  clientName: '',
  industry: '',
  outcome: '',
  imageUrl: null,
  accentColor: '#FB6107',
  animationDelay: 0,
}
