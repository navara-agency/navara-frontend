import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import FadeUp from '../animations/FadeUp'
import LiquidButton from './LiquidButton'
import PhotoBackdrop from './PhotoBackdrop'
import { CAL_LINK } from '../../config/links'

export default function CTABanner({ headingKey, bodyKey, backdrop }) {
  const { t } = useTranslation()

  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ backgroundColor: '#060078' }}
      aria-label="Call to action"
    >
      {backdrop && <PhotoBackdrop src={backdrop} opacity={0.12} />}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(155deg, rgba(6,0,120,0.95) 0%, rgba(4,0,78,0.98) 55%, rgba(20,5,100,0.95) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(3,201,224,0.18) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 text-center">
        <FadeUp>
          <span
            className="inline-block font-somar font-semibold text-primary-cyan uppercase tracking-[0.18em] mb-4"
            style={{ fontSize: '0.8rem' }}
          >
            نافارا
          </span>
          <h2
            className="font-handicrafts font-bold text-white mb-5"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.25 }}
          >
            {t(headingKey)}
          </h2>
          {bodyKey && (
            <p className="font-somar text-white/65 mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}>
              {t(bodyKey)}
            </p>
          )}
          <LiquidButton calLink={CAL_LINK}>
            {t('homeV2.hero.cta')}
          </LiquidButton>
        </FadeUp>
      </div>
    </section>
  )
}

CTABanner.propTypes = {
  headingKey: PropTypes.string.isRequired,
  bodyKey: PropTypes.string,
  backdrop: PropTypes.string,
}
