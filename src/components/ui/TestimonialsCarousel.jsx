import { useState, useLayoutEffect, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Star, Play, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react'

const GAP = 24
const AUTO_MS = 4800
const CLONES = 3 // clones appended to each side; must be >= max visibleCount

function getVisibleCount() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth < 768) return 1
  if (window.innerWidth < 1024) return 2
  return 3
}

function getInitials(name) {
  if (!name) return null
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function youtubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

// Direct video URLs (MP4/MOV/WEBM, including Cloudinary delivery URLs).
function directVideoUrl(url) {
  if (!url) return null
  if (/\.(mp4|m4v|webm|mov|ogv)(\?|$)/i.test(url)) return url
  if (/res\.cloudinary\.com\/.+\/video\//i.test(url)) return url
  return null
}

function ClientFooter({ item }) {
  const hasName = Boolean(item.clientName)
  const hasTitle = Boolean(item.clientTitle)
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {item.clientPhoto ? (
        <img
          src={item.clientPhoto}
          alt={item.clientName || 'Client'}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-somar font-bold text-xs"
          style={{ background: 'linear-gradient(135deg, #03c9e0, #52379f)' }}
          aria-hidden="true"
        >
          {getInitials(item.clientName)
            ? getInitials(item.clientName)
            : <User size={16} className="text-white/90" />}
        </div>
      )}
      {(hasName || hasTitle) && (
        <div>
          {hasName && (
            <p className="font-somar font-semibold text-primary-dark-blue text-sm leading-tight">
              {item.clientName}
            </p>
          )}
          {hasTitle && (
            <p className="font-somar text-text-gray text-xs leading-tight mt-0.5">
              {item.clientTitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function VideoCard({ item, isActive, onActivate }) {
  const { t } = useTranslation()
  const vid = youtubeId(item.videoUrl)
  const directSrc = !vid ? directVideoUrl(item.videoUrl) : null
  const videoElRef = useRef(null)
  const youtubeIframeRef = useRef(null)

  // Pause + mute the moment a card stops being the active one so cards in
  // the periphery don't keep playing audio over the centered one.
  useEffect(() => {
    if (isActive) return
    const v = videoElRef.current
    if (v) {
      try { v.pause() } catch { /* no-op */ }
    }
    const f = youtubeIframeRef.current
    if (f && f.contentWindow) {
      try {
        f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
      } catch { /* no-op */ }
    }
  }, [isActive])

  // Clicking a non-active card snaps it to the center.
  // We DON'T attach a click handler to the active card so the user can interact
  // with native video controls (play/pause/scrub) without it being intercepted.
  const handleCardClick = !isActive && onActivate ? onActivate : undefined
  const handleCardKey = handleCardClick
    ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate() } }
    : undefined

  return (
    <article
      className={`flex flex-col rounded-2xl overflow-hidden h-full bg-white transition-all duration-300 ${handleCardClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKey}
      tabIndex={handleCardClick ? 0 : -1}
      role={handleCardClick ? 'button' : undefined}
      aria-label={handleCardClick ? `View${item.clientName ? ` ${item.clientName}'s` : ''} testimonial` : undefined}
      style={{
        border: isActive ? '1.5px solid rgba(3,201,224,0.45)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: isActive
          ? '0 8px 32px rgba(3,201,224,0.14), 0 2px 12px rgba(0,0,0,0.07)'
          : '0 2px 12px rgba(0,0,0,0.05)',
        minHeight: 280,
      }}
    >
      <div
        className="h-1 w-full flex-shrink-0 transition-all duration-500"
        style={{
          background: isActive
            ? 'linear-gradient(to right, #060078, #03c9e0, #ffa5cd)'
            : 'linear-gradient(to right, #060078, #03c9e0)',
        }}
      />

      <div className="relative w-full flex-shrink-0" style={{ paddingTop: '56.25%' }}>
        {vid ? (
          <iframe
            ref={youtubeIframeRef}
            className="absolute inset-0 w-full h-full"
            // ?enablejsapi=1 lets us pause the iframe via postMessage when the card is no longer active
            src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1&enablejsapi=1`}
            title={`${item.clientName} testimonial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            // Block iframe pointer events on inactive cards so a click hits the card (activate) instead of YouTube
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          />
        ) : directSrc ? (
          <video
            ref={videoElRef}
            className="absolute inset-0 w-full h-full object-cover bg-black"
            src={directSrc}
            poster={item.thumbnailUrl || undefined}
            controls={isActive}
            playsInline
            preload="metadata"
            aria-label={`${item.clientName} testimonial video`}
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          />
        ) : item.thumbnailUrl ? (
          // Thumbnail-only testimonial — show the image in the card header
          <img
            src={item.thumbnailUrl}
            alt={item.clientName ? `${item.clientName} testimonial` : 'Testimonial'}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #060078 0%, #52379f 60%, #03c9e0 100%)' }}
          >
            {item.resultsBadge && (
              <span
                className="absolute top-4 start-4 px-3 py-1 rounded-full text-white font-somar font-semibold text-xs"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}
              >
                {item.resultsBadge}
              </span>
            )}
            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center border border-white/30">
              <Play size={24} className="text-white ms-1" fill="white" aria-hidden="true" />
            </div>
            <span className="font-somar text-white/60 text-xs">{t('homeV2.testimonials.videoComing')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {(item.rating > 0 || (item.resultsBadge && (vid || directSrc))) && (
          <div className="flex items-center justify-between mb-3">
            {item.rating > 0 && (
              <div className="flex gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
            {item.resultsBadge && (vid || directSrc) && (
              <span className="font-somar text-xs font-semibold text-primary-cyan">
                {item.resultsBadge}
              </span>
            )}
          </div>
        )}
        <blockquote
          className="font-somar text-text-gray leading-relaxed flex-1 mb-4 italic"
          style={{ fontSize: 'clamp(0.85rem, 1.3vw, 0.97rem)' }}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>
        <ClientFooter item={item} />
      </div>
    </article>
  )
}

function ArrowButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
      style={{
        background: 'rgba(6,0,120,0.07)',
        border: '1px solid rgba(6,0,120,0.15)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(3,201,224,0.12)'
        e.currentTarget.style.borderColor = 'rgba(3,201,224,0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(6,0,120,0.07)'
        e.currentTarget.style.borderColor = 'rgba(6,0,120,0.15)'
      }}
    >
      {children}
    </button>
  )
}

function PlaceholderCard() {
  const { t } = useTranslation()
  return (
    <article
      className="flex flex-col rounded-2xl overflow-hidden h-full bg-white"
      style={{
        border: '1px dashed rgba(0,0,0,0.12)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        minHeight: 280,
      }}
    >
      <div className="h-1 w-full flex-shrink-0" style={{ background: 'linear-gradient(to right, #e2e8f0, #f1f5f9)' }} />
      <div
        className="relative w-full flex-shrink-0 flex flex-col items-center justify-center gap-3"
        style={{ paddingTop: '56.25%' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Clock size={20} className="text-slate-300" />
          </div>
          <span className="font-somar text-slate-400 text-xs font-medium">
            {t('homeV2.testimonials.comingSoon', 'Coming soon')}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className="text-slate-200" aria-hidden="true" />
          ))}
        </div>
        <div className="flex-1 mb-4 space-y-2">
          <div className="h-3 rounded-full bg-slate-100 w-full" />
          <div className="h-3 rounded-full bg-slate-100 w-5/6" />
          <div className="h-3 rounded-full bg-slate-100 w-4/6" />
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-2.5 rounded-full bg-slate-100 w-24" />
            <div className="h-2 rounded-full bg-slate-100 w-16" />
          </div>
        </div>
      </div>
    </article>
  )
}

function ProgressBar({ slideKey, paused, reduced }) {
  if (reduced) return null
  return (
    <div className="h-0.5 w-20 rounded-full overflow-hidden bg-gray-200">
      <motion.div
        key={slideKey}
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(to right, #060078, #03c9e0)' }}
        initial={{ width: '0%' }}
        animate={paused ? {} : { width: '100%' }}
        transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
      />
    </div>
  )
}

export default function TestimonialsCarousel({ testimonials }) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion()
  const isRTL = i18n.language === 'ar'

  const total = testimonials.length

  // Clone array: exactly CLONES head clones + real items + CLONES tail clones.
  // We cycle through items when total < CLONES so rawIndex === CLONES always
  // points to the first real item regardless of how many testimonials there are.
  const extended = useMemo(() => {
    if (total === 0) return []
    const head = Array.from({ length: CLONES }, (_, i) =>
      testimonials[((total - CLONES + i) % total + total) % total]
    )
    const tail = Array.from({ length: CLONES }, (_, i) =>
      testimonials[i % total]
    )
    return [...head, ...testimonials, ...tail]
  }, [testimonials, total])

  // rawIndex is the position in `extended`. Real items occupy [CLONES, CLONES+total).
  const [rawIndex, setRawIndex] = useState(CLONES)
  const targetRef = useRef(CLONES)   // always up-to-date, avoids stale closures
  const isAnimating = useRef(false)
  const isInstantRef = useRef(false) // tracks snap cycle in callbacks only — never read during render
  const [snapMode, setSnapMode] = useState(false) // drives transition prop in render

  const [visibleCount, setVisibleCount] = useState(getVisibleCount)
  const [trackWidth, setTrackWidth] = useState(0)
  const [paused, setPaused] = useState(false)

  // Reset carousel to the first item whenever the testimonials list changes size.
  // This prevents rawIndex from pointing outside the new extended array.
  useEffect(() => {
    targetRef.current = CLONES
    setRawIndex(CLONES)
    isAnimating.current = false
  }, [total])

  const trackRef = useRef(null)
  const touchStartX = useRef(null)

  const cardWidth = trackWidth > 0 ? (trackWidth - GAP * (visibleCount - 1)) / visibleCount : 0
  const offset = cardWidth + GAP

  // Dot index: which real testimonial is the leftmost visible card
  const current = total > 0 ? (rawIndex - CLONES + total * 10) % total : 0

  // Which extended index is the visual center of the window
  const centeredExtIdx = rawIndex + Math.floor(visibleCount / 2)

  const translateX = offset > 0 ? rawIndex * offset * (isRTL ? 1 : -1) : 0

  const springTransition = { type: 'spring', stiffness: 280, damping: 30 }
  const instantTransition = { duration: 0 }

  // Measure track width
  useLayoutEffect(() => {
    const measure = () => { if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth)
  }, [visibleCount])

  useEffect(() => {
    const onResize = () => {
      const next = getVisibleCount()
      setVisibleCount(prev => {
        if (prev !== next) {
          targetRef.current = CLONES
          setRawIndex(CLONES)
        }
        return next
      })
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const advance = useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true
    targetRef.current += 1
    setRawIndex(targetRef.current)
  }, [])

  const retreat = useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true
    targetRef.current -= 1
    setRawIndex(targetRef.current)
  }, [])

  // Click-to-activate: snap the carousel so `extIdx` ends up at the visual center.
  // The visual center is `rawIndex + floor(visibleCount / 2)`, so we set rawIndex
  // to `extIdx - floor(visibleCount / 2)` to make the clicked card the centered one.
  const goToExt = useCallback((extIdx) => {
    if (isAnimating.current) return
    const desired = extIdx - Math.floor(visibleCount / 2)
    if (desired === targetRef.current) return
    isAnimating.current = true
    targetRef.current = desired
    setRawIndex(desired)
  }, [visibleCount])

  // After each slide animation, check if we've drifted into the clone zone.
  // If so, do an instant (invisible) snap back to the equivalent real position.
  const handleAnimationComplete = useCallback(() => {
    if (isInstantRef.current) {
      isInstantRef.current = false
      isAnimating.current = false
      setSnapMode(false)
      return
    }
    isAnimating.current = false

    const idx = targetRef.current
    if (idx >= CLONES + total) {
      isAnimating.current = true
      isInstantRef.current = true
      setSnapMode(true)
      targetRef.current = idx - total
      setRawIndex(targetRef.current)
    } else if (idx < CLONES) {
      isAnimating.current = true
      isInstantRef.current = true
      setSnapMode(true)
      targetRef.current = idx + total
      setRawIndex(targetRef.current)
    }
  }, [total])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (isRTL ? diff < 0 : diff > 0) advance()
      else retreat()
    }
    touchStartX.current = null
    setPaused(false)
  }, [advance, retreat, isRTL])

  useEffect(() => {
    if (total <= 1 || paused || reduced) return
    const id = setInterval(advance, AUTO_MS)
    return () => clearInterval(id)
  }, [total, paused, reduced, advance])

  return (
    <section
      id="testimonials"
      className="py-24 overflow-hidden"
      aria-label="Testimonials"
      style={{ background: 'linear-gradient(160deg, #f5f7ff 0%, #ffffff 50%, #fdf5fb 100%)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200 mb-6">
            <div className="flex gap-0.5" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-somar font-semibold text-yellow-700 text-sm">4.9 / 5</span>
            <span className="font-somar text-yellow-600/70 text-sm">{t('homeV2.testimonials.ratingLabel')}</span>
          </div>

          <h2
            className="font-handicrafts font-bold text-primary-dark-blue mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('homeV2.testimonials.sectionHeading')}
          </h2>
          <p className="font-somar text-text-gray max-w-xl mx-auto">
            {t('homeV2.testimonials.sectionSubheading')}
          </p>
        </motion.div>

        {/* Static layout when fewer cards than visible slots */}
        {total < visibleCount ? (
          <motion.div
            className="py-4"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {total === 0 ? (
              // No testimonials: fill all slots with placeholders
              <div className="flex" style={{ gap: GAP }}>
                {Array.from({ length: visibleCount }).map((_, i) => (
                  <div key={i} style={{ flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`, minWidth: 0 }}>
                    <PlaceholderCard />
                  </div>
                ))}
              </div>
            ) : total === 1 ? (
              // Single card: placeholder | real | placeholder — card sits in the centre slot
              <div className="flex" style={{ gap: GAP }}>
                <div style={{ flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`, minWidth: 0 }}>
                  <PlaceholderCard />
                </div>
                <div style={{ flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`, minWidth: 0 }}>
                  <VideoCard item={testimonials[0]} isActive={true} onActivate={null} />
                </div>
                <div style={{ flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`, minWidth: 0 }}>
                  <PlaceholderCard />
                </div>
              </div>
            ) : (
              // 2 cards (visibleCount=3): centre them side-by-side, no placeholder
              <div className="flex justify-center" style={{ gap: GAP }}>
                {testimonials.map((item) => (
                  <div
                    key={item.id}
                    style={{ flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`, minWidth: 0 }}
                  >
                    <VideoCard item={item} isActive={true} onActivate={null} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false) }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track — overflowX:clip lets scaled card shadow breathe vertically */}
          <div ref={trackRef} className="py-4" style={{ overflowX: 'clip' }}>
            <motion.div
              className="flex"
              style={{ gap: GAP }}
              animate={{ x: reduced ? 0 : translateX }}
              transition={reduced || snapMode ? instantTransition : springTransition}
              onAnimationComplete={handleAnimationComplete}
            >
              {extended.map((item, idx) => {
                // Active = the centered card (hover preview removed so click-to-activate is the source of truth)
                const isActive = idx === centeredExtIdx
                return (
                  <motion.div
                    key={idx}
                    animate={reduced ? {} : {
                      opacity: isActive ? 1 : 0.7,
                      scale: isActive ? 1.03 : 0.97,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      flex: `0 0 calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`,
                      minWidth: 0,
                    }}
                  >
                    <VideoCard
                      item={item}
                      isActive={isActive}
                      onActivate={() => goToExt(idx)}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <div className="absolute top-1/2 -translate-y-1/2 start-2 lg:-start-6">
                <ArrowButton onClick={retreat} label="Previous testimonial">
                  <ChevronLeft size={20} className="text-primary-dark-blue" />
                </ArrowButton>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 end-2 lg:-end-6">
                <ArrowButton onClick={advance} label="Next testimonial">
                  <ChevronRight size={20} className="text-primary-dark-blue" />
                </ArrowButton>
              </div>
            </>
          )}
        </motion.div>
        )} {/* end total >= visibleCount carousel */}

        {/* Dots + progress — only when the full carousel is active */}
        {total >= visibleCount && total > 1 && (
          <div className="flex flex-col items-center gap-3 mt-8">
            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => {
                    if (isAnimating.current) return
                    targetRef.current = CLONES + i
                    setRawIndex(CLONES + i)
                  }}
                  className="h-2 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: i === current ? 28 : 8,
                    background: i === current
                      ? 'linear-gradient(to right, #060078, #03c9e0)'
                      : '#d1d5db',
                  }}
                />
              ))}
            </div>
            <ProgressBar slideKey={current} paused={paused} reduced={reduced} />
          </div>
        )}
      </div>
    </section>
  )
}
