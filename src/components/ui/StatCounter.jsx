import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import CountUp from '../animations/CountUp'

export default function StatCounter({ value, suffix = '', label, className = '' }) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <div
        className="font-glancyr font-bold text-navara-orange"
        style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
      >
        <CountUp
          numericValue={value}
          suffix={suffix}
          duration={shouldReduceMotion ? 0 : 2}
        />
      </div>
      {label && (
        <p className="font-sherika text-sm text-gray-500 mt-1">{label}</p>
      )}
    </div>
  )
}
