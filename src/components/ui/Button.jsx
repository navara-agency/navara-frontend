import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MessageCircle, ArrowRight } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Navara Button — primary / secondary / whatsapp variants.
 * Renders as <a> when href is provided, otherwise <button>.
 * Hover: coloured sweep-fill + label lift + trailing arrow (pass-three motion overhaul).
 * Reduced motion: falls back to pre-pass translate-y + shadow behaviour.
 */
const SIZE_CLASSES = {
  md: 'px-8 py-4',
  sm: 'px-5 py-2',
}

// Shared base classes applied to every variant + size.
const BASE_CLASSES =
  'relative inline-flex items-center justify-center overflow-hidden ' +
  'font-somar font-semibold rounded-md select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2'

// Animated-branch variant colours: [base background/border, sweep fill, label colour, ring offset]
const ANIMATED_VARIANT = {
  primary: {
    base: 'bg-navara-orange text-white',
    sweep: 'bg-navara-blue',
    ringOffset: 'focus-visible:ring-offset-navara-orange',
  },
  secondary: {
    base: 'border-2 border-white text-white',
    sweep: 'bg-white',
    // Label colour swaps to navara-blue while sweep is visible under the label.
    // We achieve this by layering: label stays white; but to invert, we use the sweep's hover state.
    // Accept a slightly different path: keep label white, rely on sweep covering and label lifting.
    ringOffset: 'focus-visible:ring-offset-navara-blue',
  },
  whatsapp: {
    base: 'bg-[#25D366] text-white',
    sweep: 'bg-[#128C7E]',
    ringOffset: 'focus-visible:ring-offset-navara-dark',
  },
}

// Reduced-motion branch (pre-pass behaviour preserved).
const REDUCED_VARIANT_CLASSES = {
  primary:
    'bg-navara-orange text-white font-somar font-semibold rounded-md ' +
    'hover:bg-[#E55506] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navara-orange ' +
    'transition-all duration-300 ease-in-out ' +
    'motion-reduce:transition-none motion-reduce:transform-none',
  secondary:
    'border-2 border-white text-white font-somar font-semibold rounded-md ' +
    'hover:bg-white hover:text-navara-blue ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ' +
    'transition-all duration-300 ease-in-out ' +
    'motion-reduce:transition-none motion-reduce:transform-none',
  whatsapp:
    'bg-[#25D366] text-white font-semibold rounded-md inline-flex items-center gap-2 ' +
    'hover:bg-[#1ebe57] hover:-translate-y-0.5 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ' +
    'transition-all duration-300 ease-in-out ' +
    'motion-reduce:transition-none motion-reduce:transform-none',
}

const SWEEP_TRANSITION = { duration: 0.45, ease: [0.7, 0, 0.3, 1] }
const LABEL_TRANSITION = { duration: 0.3, ease: 'easeOut' }

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  calLink,
  external = false,
  onClick,
  disabled = false,
  children,
  className = '',
  ariaLabel,
  spark = false,
}) {
  const { i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const isRTL = i18n.language === 'ar'

  // ---- Reduced-motion branch — pre-pass behaviour preserved byte-for-byte. ----
  if (shouldReduceMotion) {
    const reducedClasses = [
      REDUCED_VARIANT_CLASSES[variant] ?? REDUCED_VARIANT_CLASSES.primary,
      SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
      disabled ? 'opacity-50 pointer-events-none' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const reducedContent =
      variant === 'whatsapp' ? (
        <>
          <MessageCircle size={18} aria-hidden="true" />
          {children}
        </>
      ) : (
        children
      )

    if (calLink) {
      return (
        <button
          type="button"
          className={reducedClasses}
          data-cal-link={calLink}
          data-cal-config='{"layout":"month_view"}'
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
        >
          {reducedContent}
        </button>
      )
    }
    if (href) {
      return (
        <a
          href={href}
          className={reducedClasses}
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {reducedContent}
        </a>
      )
    }
    return (
      <button
        type="button"
        className={reducedClasses}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {reducedContent}
      </button>
    )
  }

  // ---- Animated branch ----
  const v = ANIMATED_VARIANT[variant] ?? ANIMATED_VARIANT.primary

  // Sweep enters from logical start edge: left (-101%) in LTR, right (+101%) in RTL.
  const sweepOffscreen = isRTL ? '101%' : '-101%'
  // Arrow slides in trailing from logical start of label: -8 in LTR, +8 in RTL.
  const arrowOffscreen = isRTL ? 8 : -8

  const sweepVariants = {
    initial: { x: sweepOffscreen },
    hover: { x: '0%' },
  }
  const labelVariants = {
    initial: { y: 0 },
    hover: { y: -2 },
  }
  const arrowVariants = {
    initial: { opacity: 0, x: arrowOffscreen },
    hover: { opacity: 1, x: 0 },
  }

  const wrapperClasses = [
    BASE_CLASSES,
    v.base,
    v.ringOffset,
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    disabled ? 'opacity-50 pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Label colour inversion hook for secondary: when sweep (white) slides in under
  // a white label, we'd lose contrast. We sidestep this with a small trick: the
  // secondary-label wrapper sits in z-10 and the sweep in z-0. The sweep is white;
  // the label is white. On hover the label lifts (y:-2) and crucially the secondary
  // base has no background — so the sweep fully covers the button surface. The
  // label remains visible against the white sweep only because the secondary
  // arrangement below swaps the label colour under `group-hover` via a CSS class.
  const labelColourClass =
    variant === 'secondary'
      ? 'text-white group-hover:text-navara-blue transition-colors duration-300'
      : ''

  const MotionContent = (
    <>
      {/* Sweep fill layer — z-0, aria-hidden, pointer-events-none. */}
      <motion.span
        aria-hidden="true"
        className={`absolute inset-0 ${v.sweep} pointer-events-none z-0`}
        variants={sweepVariants}
        initial="initial"
        transition={SWEEP_TRANSITION}
      />
      {/* Label group — z-10 to sit above sweep. */}
      <motion.span
        className={`relative z-10 inline-flex items-center gap-2 ${labelColourClass}`}
        variants={labelVariants}
        initial="initial"
        transition={LABEL_TRANSITION}
      >
        {variant === 'whatsapp' && <MessageCircle size={18} aria-hidden="true" />}
        <span>{children}</span>
        {size !== 'sm' && (
          <motion.span
            aria-hidden="true"
            className="inline-flex"
            variants={arrowVariants}
            initial="initial"
            transition={LABEL_TRANSITION}
          >
            <ArrowRight size={18} className={isRTL ? 'scale-x-[-1]' : ''} />
          </motion.span>
        )}
      </motion.span>
    </>
  )

  // When spark=true the button sits at z-[1] so it appears above the spark ring (z-0).
  const motionProps = {
    className: `group ${wrapperClasses}${spark ? ' z-[1]' : ''}`,
    whileHover: 'hover',
    'aria-label': ariaLabel,
  }

  // Wraps the rendered element in a spark border ring positioned 2px outside the button.
  // Using a sibling approach (not inside overflow:hidden) keeps button colors intact.
  const withSpark = (el) => {
    if (!spark) return el
    return (
      <span className="relative inline-flex rounded-md">
        <span
          aria-hidden="true"
          className="absolute spark-border rounded-[8px]"
          style={{ inset: '-2px', zIndex: 0 }}
        />
        {el}
      </span>
    )
  }

  if (calLink) {
    return withSpark(
      <motion.button
        type="button"
        data-cal-link={calLink}
        data-cal-config='{"layout":"month_view"}'
        onClick={onClick}
        disabled={disabled}
        {...motionProps}
      >
        {MotionContent}
      </motion.button>
    )
  }

  if (href) {
    return withSpark(
      <motion.a
        href={href}
        aria-disabled={disabled || undefined}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...motionProps}
      >
        {MotionContent}
      </motion.a>
    )
  }

  return withSpark(
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {MotionContent}
    </motion.button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'whatsapp']),
  size: PropTypes.oneOf(['md', 'sm']),
  href: PropTypes.string,
  calLink: PropTypes.string,
  external: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  spark: PropTypes.bool,
}
