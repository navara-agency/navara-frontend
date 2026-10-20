import { useTranslation } from 'react-i18next'
import CaseStudyCard from './CaseStudyCard'
import { useApi } from '../../hooks/useApi'

// Published case studies from the dashboard (/api/case-studies returns only
// status = published, already ordered by sortOrder). The section is hidden
// until there is at least one to show.
export default function CaseStudiesSection() {
  const { t } = useTranslation()
  const { data } = useApi('/api/case-studies')
  const items = Array.isArray(data) ? data : []
  if (items.length === 0) return null

  return (
    <section id="case-studies" className="py-24 bg-white" aria-label={t('homeV2.caseStudies.heading')}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2
            className="font-handicrafts font-semibold text-primary-dark-blue"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            {t('homeV2.caseStudies.heading')}
          </h2>
          <p className="font-somar text-primary-dark-blue/70 mt-3 max-w-xl mx-auto">
            {t('homeV2.caseStudies.sub')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cs, i) => (
            <CaseStudyCard
              key={cs.id}
              clientName={cs.client}
              title={cs.title}
              industry={cs.industry}
              outcome={cs.outcome}
              imageUrl={cs.coverImage}
              accentColor={cs.accentColor || '#D43FEB'}
              animationDelay={Math.min(i, 5) * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
