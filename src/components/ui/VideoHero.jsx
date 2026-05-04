import { motion, useScroll, useTransform } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * VideoHero — full-bleed video background for page heroes.
 * When `reduced` is true renders the poster image at low opacity instead of video.
 * Video is hidden via CSS on mobile so it does not download.
 */
export default function VideoHero({
  src,
  poster,
  overlayClassName = 'from-navara-blue/90 via-navara-blue/60 to-navara-blue/90',
  reduced = false,
}) {
  const { scrollY } = useScroll()
  const overlayOpacity = useTransform(scrollY, [0, 600], [0, 0.35])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Poster shown on mobile (video hidden via CSS) or as native video fallback */}
      {poster && (
        <img
          src={poster}
          alt=""
          loading="eager"
          className={`absolute inset-0 block w-full h-full object-cover ${reduced ? 'opacity-20' : 'opacity-[0.15] md:opacity-0'}`}
        />
      )}

      {!reduced && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 hidden md:block w-full h-full object-cover scale-[1.02]"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      <div className={`absolute inset-0 bg-gradient-to-b ${overlayClassName}`} />
      <motion.div
        className="absolute inset-0 bg-navara-blue"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-navara-turquoise/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-navara-orange/10 blur-[100px]" />
      </div>
    </div>
  )
}

VideoHero.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  overlayClassName: PropTypes.string,
  reduced: PropTypes.bool,
}
