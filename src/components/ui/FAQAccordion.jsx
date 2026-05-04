import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const containerVariants = (reduced) => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
})

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function FAQAccordion({ items = [] }) {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState(null)
  const shouldReduceMotion = useReducedMotion()

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  return (
    <motion.div
      className="divide-y divide-gray-100"
      variants={containerVariants(shouldReduceMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {items.map((item) => {
        const { id, questionKey, answerKey, question, answer } = item
        const resolvedQuestion = question != null ? question : (questionKey ? t(questionKey) : '')
        const resolvedAnswer = answer != null ? answer : (answerKey ? t(answerKey) : '')
        const isOpen = openId === id
        const answerId = `faq-answer-${id}`

        return (
          <motion.div
            key={id}
            variants={itemVariants}
            className={`transition-colors duration-200 ${isOpen ? 'border-s-4 border-primary-cyan' : 'border-s-4 border-transparent'}`}
          >
            <button
              className="w-full flex items-center justify-between py-5 px-4 text-start cursor-pointer group"
              onClick={() => toggle(id)}
              onKeyDown={(e) => handleKeyDown(e, id)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              type="button"
            >
              <span
                className={`font-somar font-semibold pe-4 transition-colors duration-200 ${
                  isOpen ? 'text-secondary-purple' : 'text-primary-dark-blue group-hover:text-primary-cyan'
                }`}
                style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}
              >
                {resolvedQuestion}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                className="flex-shrink-0 text-primary-cyan"
                aria-hidden="true"
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={answerId}
                  role="region"
                  initial={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="font-somar text-text-gray pb-5 px-4 leading-relaxed whitespace-pre-wrap">
                    {resolvedAnswer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
