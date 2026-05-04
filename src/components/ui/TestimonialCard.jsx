import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import FadeUp from '../animations/FadeUp'

/**
 * Placeholder testimonial card.
 * Shows "Client testimonial coming soon" in empty state.
 */
export default function TestimonialCard({ animationDelay = 0 }) {
  const { t } = useTranslation()

  return (
    <FadeUp delay={animationDelay}>
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 h-full">
        {/* Placeholder state */}
        <div className="text-center text-gray-400 py-8">
          <div className="text-6xl font-glancyr text-navara-turquoise/20 mb-4">"</div>
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-navara-orange text-navara-orange" aria-hidden="true" />
            ))}
          </div>
          <p className="font-sherika text-sm text-gray-400 italic mb-6">
            {t('common.placeholder.testimonial')}
          </p>
          <div className="h-px bg-gray-100 mb-4" />
          <div className="font-sherika text-xs text-gray-300">— Client Name · Title · Company</div>
        </div>
      </div>
    </FadeUp>
  )
}
