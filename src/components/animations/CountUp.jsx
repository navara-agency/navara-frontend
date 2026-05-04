import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import PropTypes from 'prop-types'

export default function CountUp({ numericValue, suffix, duration, className, style }) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(shouldReduceMotion ? numericValue : 0)

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return
    const controls = animate(0, numericValue, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    })
    return controls.stop
  }, [isInView, shouldReduceMotion, numericValue, duration])

  return (
    <span ref={ref} className={className} style={style}>
      {display}{suffix}
    </span>
  )
}

CountUp.propTypes = {
  numericValue: PropTypes.number.isRequired,
  suffix: PropTypes.string,
  duration: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
}

CountUp.defaultProps = {
  suffix: '',
  duration: 2,
  className: '',
  style: {},
}
