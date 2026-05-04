import { motion, useScroll, useTransform } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * PhotoBackdrop — absolutely-positioned decorative section image layer.
 * Always aria-hidden / alt="" / lazy-loaded. With `parallax=true`, moves at ~85%
 * page scroll speed relative to its section via useScroll({ target: sectionRef }).
 */
export default function PhotoBackdrop({
  src,
  opacity = 0.15,
  position = 'center',
  blendMode,
  parallax = false,
  sectionRef,
  className = '',
}) {
  const { scrollYProgress } = useScroll(
    parallax && sectionRef ? { target: sectionRef } : undefined
  )
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])

  const style = {
    opacity,
    objectPosition: position,
    ...(blendMode ? { mixBlendMode: blendMode } : null),
    ...(parallax && sectionRef ? { y } : null),
  }

  const ImgTag = parallax && sectionRef ? motion.img : 'img'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      <ImgTag
        src={src}
        alt=""
        loading="lazy"
        className={`w-full h-full object-cover select-none ${className}`}
        style={style}
      />
    </div>
  )
}

PhotoBackdrop.propTypes = {
  src: PropTypes.string.isRequired,
  opacity: PropTypes.number,
  position: PropTypes.string,
  blendMode: PropTypes.string,
  parallax: PropTypes.bool,
  sectionRef: PropTypes.shape({ current: PropTypes.any }),
  className: PropTypes.string,
}
