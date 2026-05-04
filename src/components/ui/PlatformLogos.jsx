import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LogosMarquee from './LogosMarquee'
import { useApi } from '../../hooks/useApi'
import { LOGOS as FALLBACK_LOGOS } from '../../data/mockDashboard'

export default function PlatformLogos() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const { data, error } = useApi('/api/logos')

  // Backend returns { clients: [...], partners: [...] }; LogosMarquee wants a flat array with `type`
  // field and splits internally. Fallback to bundled mocks if the API is unreachable.
  const allLogos = error || !data
    ? FALLBACK_LOGOS
    : [
        ...(data.clients || []).map((l) => ({ ...l, type: 'client' })),
        ...(data.partners || []).map((l) => ({ ...l, type: 'partner' })),
      ]

  return (
    <section id="logos" className="bg-bg-light py-20" aria-label="Platform logos">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <motion.h2
          className="font-somar font-semibold text-center text-primary-dark-blue mb-10"
          style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('homeV2.logos.heading')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.15 }}
        >
          <LogosMarquee logos={allLogos} logoSize="h-14 w-auto" />
        </motion.div>
      </div>
    </section>
  )
}
