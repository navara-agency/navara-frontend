import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import PropTypes from 'prop-types'

function getEmbedUrl(url) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/\s]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  return null
}

export default function VideoLightbox({ videoUrl, isOpen, onClose, clientName }) {
  const containerRef = useRef(null)
  const embedUrl = getEmbedUrl(videoUrl)
  const isEmbed = Boolean(embedUrl)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length) focusable[0].focus()
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={clientName ? `Video testimonial from ${clientName}` : 'Video testimonial'}
          ref={containerRef}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close video"
          >
            <X size={22} />
          </button>

          {/* Video container */}
          <div
            className="relative z-10 w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
              {isEmbed ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={clientName ? `Video testimonial from ${clientName}` : 'Video testimonial'}
                />
              ) : (
                <video
                  src={videoUrl}
                  className="w-full h-full"
                  autoPlay
                  controls
                  playsInline
                >
                  {/* captions track intentionally empty for MVP */}
                  <track kind="captions" />
                </video>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

VideoLightbox.propTypes = {
  videoUrl: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clientName: PropTypes.string,
}

VideoLightbox.defaultProps = {
  videoUrl: null,
  clientName: '',
}
