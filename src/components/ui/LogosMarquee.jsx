import { useState } from 'react'
import PropTypes from 'prop-types'

export default function LogosMarquee({ logos, logoSize = 'h-12 w-auto' }) {
  const clientLogos = logos.filter(l => l.type !== 'partner')
  const partnerLogos = logos.filter(l => l.type === 'partner')

  if (clientLogos.length === 0) {
    return (
      <div className="py-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer w-24 h-10 rounded-lg"
              aria-hidden="true"
            />
          ))}
        </div>
        {partnerLogos.length > 0 && <PartnerRow partners={partnerLogos} />}
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="marquee-wrapper overflow-hidden" dir="ltr">
        <div className="marquee-track">
          {clientLogos.map(logo => (
            <LogoItem key={logo.id} logo={logo} logoSize={logoSize} />
          ))}
          {clientLogos.map(logo => (
            <LogoItem key={`dup-${logo.id}`} logo={logo} logoSize={logoSize} aria-hidden="true" />
          ))}
        </div>
      </div>
      {partnerLogos.length > 0 && <PartnerRow partners={partnerLogos} />}
    </div>
  )
}

function LogoItem({ logo, logoSize, 'aria-hidden': ariaHidden }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const content = logo.image && !imgFailed ? (
    <img
      src={logo.image}
      alt={logo.name}
      className={`${logoSize} object-contain`}
      style={{
        filter: hovered ? 'grayscale(0)' : 'grayscale(1)',
        opacity: hovered ? 1 : 0.45,
        transition: 'filter 0.4s ease, opacity 0.4s ease',
      }}
      onError={() => setImgFailed(true)}
    />
  ) : (
    <span className="font-somar font-bold text-primary-dark-blue/40 hover:text-primary-dark-blue/70 transition-colors duration-300 whitespace-nowrap tracking-wide uppercase text-sm">
      {logo.name}
    </span>
  )

  const sharedProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }

  const wrapper = logo.url ? (
    <a
      href={logo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 px-10 flex items-center"
      aria-label={logo.name}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      {...sharedProps}
    >
      {content}
    </a>
  ) : (
    <div className="flex-shrink-0 px-10 flex items-center" aria-hidden={ariaHidden} {...sharedProps}>
      {content}
    </div>
  )

  return (
    <>
      {wrapper}
      <span className="flex-shrink-0 text-primary-cyan/30 text-xl self-center" aria-hidden="true">·</span>
    </>
  )
}

function PartnerRow({ partners }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {partners.map(p => (
        <div
          key={p.id}
          className="h-8 px-4 bg-gray-50 border border-gray-100 rounded flex items-center justify-center"
        >
          {p.image ? (
            <img src={p.image} alt={p.name} className="h-5 w-auto object-contain" style={{ filter: 'brightness(0)', opacity: 0.5 }} />
          ) : (
            <span className="font-somar text-xs text-gray-400">{p.name}</span>
          )}
        </div>
      ))}
    </div>
  )
}

LogosMarquee.propTypes = {
  logos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    type: PropTypes.string,
    url: PropTypes.string,
    order: PropTypes.number,
  })),
  logoSize: PropTypes.string,
}

LogosMarquee.defaultProps = {
  logos: [],
}
