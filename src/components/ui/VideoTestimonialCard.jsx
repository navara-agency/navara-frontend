import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Play, Star } from 'lucide-react'
import PropTypes from 'prop-types'
import FadeUp from '../animations/FadeUp'
import VideoLightbox from './VideoLightbox'

function getYouTubeThumbnail(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/\s]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-navara-orange text-navara-orange' : 'text-gray-200'}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default function VideoTestimonialCard({
  clientName,
  clientTitle,
  clientCompany,
  videoUrl,
  thumbnailUrl,
  quote,
  rating,
  animationDelay,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const derivedThumbnail = thumbnailUrl || getYouTubeThumbnail(videoUrl)
  const hasVideo = Boolean(videoUrl)

  return (
    <>
      <FadeUp delay={animationDelay}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
          {/* Video / Placeholder area */}
          <div className="aspect-video relative bg-gray-100">
            {hasVideo && derivedThumbnail ? (
              <>
                <img
                  src={derivedThumbnail}
                  alt={clientName ? `${clientName} testimonial` : 'Video testimonial'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20" />
              </>
            ) : hasVideo ? (
              <div className="absolute inset-0 bg-gradient-to-br from-navara-blue/80 to-navara-blue" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-2">
                <Camera size={32} className="text-navara-turquoise/60" aria-hidden="true" />
                <p className="font-sherika text-xs text-gray-400">Video testimonial coming soon</p>
              </div>
            )}

            {hasVideo && (
              <button
                className="absolute inset-0 flex items-center justify-center"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Play testimonial video${clientName ? ` from ${clientName}` : ''}`}
              >
                <motion.div
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={20} className="text-navara-blue fill-navara-blue ms-1" aria-hidden="true" />
                </motion.div>
              </button>
            )}

            {!hasVideo && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <StarRating rating={rating} />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="p-5">
            {hasVideo && (
              <div className="mb-3">
                <StarRating rating={rating} />
              </div>
            )}
            {quote && (
              <p className="font-sherika text-sm text-gray-600 italic leading-relaxed mb-4 line-clamp-3">
                &ldquo;{quote}&rdquo;
              </p>
            )}
            <div className="border-t border-gray-50 pt-3">
              {clientName ? (
                <>
                  <p className="font-sherika font-semibold text-navara-dark text-sm">{clientName}</p>
                  <p className="font-sherika text-xs text-gray-400 mt-0.5">
                    {[clientTitle, clientCompany].filter(Boolean).join(' · ')}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-3 w-24 skeleton-shimmer rounded mb-1" />
                  <div className="h-2 w-36 skeleton-shimmer rounded" />
                </>
              )}
            </div>
          </div>
        </div>
      </FadeUp>

      <VideoLightbox
        videoUrl={videoUrl}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        clientName={clientName}
      />
    </>
  )
}

VideoTestimonialCard.propTypes = {
  clientName: PropTypes.string,
  clientTitle: PropTypes.string,
  clientCompany: PropTypes.string,
  videoUrl: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  quote: PropTypes.string,
  rating: PropTypes.number,
  animationDelay: PropTypes.number,
}

VideoTestimonialCard.defaultProps = {
  clientName: '',
  clientTitle: '',
  clientCompany: '',
  videoUrl: null,
  thumbnailUrl: null,
  quote: '',
  rating: 5,
  animationDelay: 0,
}
