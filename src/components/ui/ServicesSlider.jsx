import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import ServiceCard from './ServiceCard'

const GAP_DESKTOP_PX = 32 // Tailwind gap-8

function computeVisibleCount() {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 768px)').matches) return 2
  return 1
}

export default function ServicesSlider({ services, autoAdvanceMs = 5000 }) {
  const { i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const isRTL = i18n.language === 'ar'

  const [visibleCount, setVisibleCount] = useState(computeVisibleCount)
  const [rawActiveIndex, setActiveIndex] = useState(0)
  const [trackWidth, setTrackWidth] = useState(0)

  const trackContainerRef = useRef(null)
  const isPausedRef = useRef(false)
  const tickRef = useRef(null)

  const mobileLayout = visibleCount === 1
  const maxIndex = Math.max(services.length - visibleCount, 0)
  // Derive the clamped index on read — avoids setState-in-effect cascades.
  const activeIndex = Math.min(rawActiveIndex, maxIndex)
  const gap = GAP_DESKTOP_PX
  const cardWidth =
    trackWidth > 0 ? (trackWidth - gap * (visibleCount - 1)) / visibleCount : 0

  // Responsive layout listener.
  useEffect(() => {
    const onResize = () => setVisibleCount(computeVisibleCount())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Track-container width measurement (for drag constraints).
  useEffect(() => {
    if (!trackContainerRef.current) return undefined
    const el = trackContainerRef.current
    const measure = () => setTrackWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleCount])

  // goTo — bounded index jump.
  const goTo = useCallback(
    (i) => {
      setActiveIndex(Math.max(0, Math.min(i, maxIndex)))
    },
    [maxIndex],
  )

  // Auto-advance.
  useEffect(() => {
    if (mobileLayout || shouldReduceMotion || maxIndex === 0) return undefined

    tickRef.current = setInterval(() => {
      if (isPausedRef.current) return
      setActiveIndex((idx) => {
        if (isRTL) {
          return idx <= 0 ? maxIndex : idx - 1
        }
        return idx >= maxIndex ? 0 : idx + 1
      })
    }, autoAdvanceMs)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [autoAdvanceMs, isRTL, maxIndex, mobileLayout, shouldReduceMotion])

  // Tab-visibility pause.
  useEffect(() => {
    const onVisibilityChange = () => {
      isPausedRef.current = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const handleMouseEnter = () => {
    isPausedRef.current = true
  }
  const handleMouseLeave = () => {
    isPausedRef.current = false
  }

  const handleDragStart = () => {
    isPausedRef.current = true
  }
  const handleDragEnd = (_, info) => {
    if (cardWidth === 0) {
      isPausedRef.current = false
      return
    }
    const step = cardWidth + gap
    // In LTR, negative offset.x = drag left = advance index.
    // In RTL, sign inverts.
    const delta = Math.round(-info.offset.x / step) * (isRTL ? -1 : 1)
    const next = Math.max(0, Math.min(activeIndex + delta, maxIndex))
    setActiveIndex(next)
    // Resume auto-advance after a short delay.
    setTimeout(() => {
      isPausedRef.current = false
    }, 1500)
  }

  // Mobile branch — native snap-scroll.
  if (mobileLayout) {
    return (
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 mb-10"
        style={{ scrollPaddingInlineStart: '1.5rem' }}
      >
        {services.map((s, i) => (
          <div
            key={s.titleKey}
            className="flex-[0_0_85%] snap-start"
            style={{ minHeight: 0 }}
          >
            <ServiceCard {...s} number={i + 1} animationDelay={0} />
          </div>
        ))}
      </div>
    )
  }

  // Desktop / tablet branch — paged slider.
  const dragConstraintsLeft = -(maxIndex * (cardWidth + gap))
  const trackX = (isRTL ? 1 : -1) * activeIndex * (cardWidth + gap)

  return (
    <div className="relative mb-10">
      <div
        ref={trackContainerRef}
        className="overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="flex gap-8"
          drag={shouldReduceMotion ? false : 'x'}
          dragConstraints={
            isRTL
              ? { left: 0, right: -dragConstraintsLeft }
              : { left: dragConstraintsLeft, right: 0 }
          }
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{ x: trackX }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 32 }
          }
          style={{ touchAction: 'pan-y' }}
        >
          {services.map((s, i) => (
            <div
              key={s.titleKey}
              className="flex flex-col"
              style={{
                flex: `0 0 calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
              }}
            >
              <ServiceCard {...s} number={i + 1} animationDelay={0} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex || undefined}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'h-2 w-6 bg-navara-orange'
                  : 'h-2 w-2 bg-navara-blue/20 hover:bg-navara-blue/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

ServicesSlider.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      titleKey: PropTypes.string.isRequired,
      bodyKey: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      imageUrl: PropTypes.string,
      accentColor: PropTypes.string,
    }),
  ).isRequired,
  autoAdvanceMs: PropTypes.number,
}
