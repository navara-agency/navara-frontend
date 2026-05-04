import PropTypes from 'prop-types'

const VARIANTS = {
  wave: (fill) => (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  ),
  slant: (fill) => (
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <polygon points="0,60 1440,0 1440,60" fill={fill} />
    </svg>
  ),
  curve: (fill) => (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M0,80 Q720,0 1440,80 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  ),
}

export default function SectionDivider({ variant = 'wave', fillColor = '#ffffff', bgColor = 'transparent', flipX = false, flipY = false, className = '' }) {
  const svg = VARIANTS[variant] ? VARIANTS[variant](fillColor) : VARIANTS.wave(fillColor)

  const scaleX = flipX ? -1 : 1
  const scaleY = flipY ? -1 : 1

  return (
    <div
      className={`w-full h-16 md:h-20 ${className}`}
      style={{
        backgroundColor: bgColor,
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: 'center',
        lineHeight: 0,
        display: 'block',
      }}
      aria-hidden="true"
    >
      {svg}
    </div>
  )
}

SectionDivider.propTypes = {
  variant: PropTypes.oneOf(['wave', 'slant', 'curve']),
  fillColor: PropTypes.string,
  bgColor: PropTypes.string,
  flipX: PropTypes.bool,
  flipY: PropTypes.bool,
  className: PropTypes.string,
}
