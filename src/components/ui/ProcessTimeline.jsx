import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CAL_LINK } from '../../config/links'

export default function ProcessTimeline({ onCtaClick }) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  const steps = t('homeV2.process.steps', { returnObjects: true })

  const handleCta = onCtaClick ?? (() => navigate('/contact#contact-form'))

  const connectorClass = isRTL
    ? 'bg-gradient-to-r from-[#03c9e0] via-[#3322cc] to-[#060078]'
    : 'bg-gradient-to-r from-[#060078] via-[#3322cc] to-[#03c9e0]'

  return (
    <section id="process" className="bg-white py-24" aria-label="Our process">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <motion.h2
          className="font-handicrafts font-bold text-primary-dark-blue text-center mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('homeV2.process.sectionHeading')}
        </motion.h2>

        <motion.p
          className="font-somar text-text-gray text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('homeV2.process.sectionSubheading')}
        </motion.p>

        {/* Desktop: absolute connector line + aligned 5-column grid */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connector line sits at the vertical center of the 80px circles (top: 39px) */}
            <motion.div
              aria-hidden="true"
              className={`absolute h-0.5 ${connectorClass} z-0`}
              style={{
                top: 39,
                left: '10%',
                right: '10%',
                transformOrigin: isRTL ? 'right' : 'left',
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reduced ? { duration: 0 } : { duration: 1, delay: 0.3, ease: 'easeOut' }}
            />

            <div className="relative z-10 grid grid-cols-5 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center text-center px-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg, #060078, #3322cc, #03c9e0)' }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="font-handicrafts font-bold text-white text-3xl leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </motion.div>

                  <h3
                    className="font-somar font-bold text-primary-dark-blue mb-2"
                    style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-somar text-text-gray"
                    style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical stack */}
        <div className="lg:hidden">
          {steps.map((step, i) => (
            <div key={i}>
              <motion.div
                className="flex gap-5 items-start"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #060078, #3322cc, #03c9e0)' }}
                  >
                    <span className="font-handicrafts font-bold text-white text-2xl leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-1 h-10 bg-gradient-to-b from-[#060078] via-[#3322cc] to-[#03c9e0]" />
                  )}
                </div>

                <div className={`pt-2 ${i < steps.length - 1 ? 'pb-0' : ''}`}>
                  <h3
                    className="font-somar font-bold text-primary-dark-blue mb-2"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-somar text-text-gray leading-relaxed mb-2"
                    style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            type="button"
            onClick={handleCta}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-somar font-semibold text-white min-h-[44px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #060078, #3322cc, #03c9e0)' }}
          >
            {t('homeV2.process.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  )
}
