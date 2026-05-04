import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const BG_MAP = {
  white: 'bg-white',
  light: 'bg-navara-light',
  blue: 'bg-navara-blue text-white',
  gradient: 'bg-navara-gradient text-white',
  dark: 'bg-primary-dark-blue text-white',
  'dark-alt': 'bg-[#010018] text-white',
}

const Section = forwardRef(function Section(
  { id, variant = 'white', paddingY = 'py-24', className = '', backdrop, children },
  ref
) {
  const bg = BG_MAP[variant] ?? BG_MAP.white
  const isDark = variant === 'dark' || variant === 'dark-alt'

  return (
    <section
      ref={ref}
      id={id}
      className={`${bg} ${paddingY} relative overflow-hidden scroll-mt-20 ${className}`}
    >
      {isDark && (
        <span
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(3,201,224,0.15) 50%, rgba(255,255,255,0.08) 70%, transparent 100%)' }}
        />
      )}
      {backdrop}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative isolate">{children}</div>
    </section>
  )
})

Section.propTypes = {
  id: PropTypes.string,
  variant: PropTypes.oneOf(['white', 'light', 'blue', 'gradient', 'dark', 'dark-alt']),
  paddingY: PropTypes.string,
  className: PropTypes.string,
  backdrop: PropTypes.node,
  children: PropTypes.node,
}

export default Section
