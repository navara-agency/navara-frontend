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
      <div className="marquee-wrapper overflow-hidden py-3" dir="ltr">
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

  // Client logos are uploaded as white transparent PNGs, so each one sits on a
  // brand-navy card. The filter forces any colored fallback logo to white too.
  const content = logo.image && !imgFailed ? (
    <img
      src={logo.image}
      alt={logo.name}
      className={`${logoSize} max-w-full object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
      style={{ filter: 'brightness(0) invert(1)' }}
      onError={() => setImgFailed(true)}
    />
  ) : (
    <span className="font-somar font-bold text-white/80 group-hover:text-white transition-colors duration-300 whitespace-nowrap tracking-wide uppercase text-sm">
      {logo.name}
    </span>
  )

  const cardClass =
    'group relative flex-shrink-0 mx-3 w-48 h-28 px-5 flex items-center justify-center overflow-hidden rounded-2xl ' +
    'bg-gradient-to-br from-primary-dark-blue to-[#0d0a9e] border border-white/10 ' +
    'shadow-[0_8px_24px_-12px_rgba(6,0,120,0.55)] transition-all duration-300 ease-out ' +
    'hover:-translate-y-1 hover:border-primary-cyan/50 hover:shadow-[0_14px_32px_-12px_rgba(3,201,224,0.45)]'

  const inner = (
    <>
      <span
        className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary-cyan/20 blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="relative flex items-center justify-center">{content}</span>
    </>
  )

  return logo.url ? (
    <a
      href={logo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClass}
      aria-label={logo.name}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
    >
      {inner}
    </a>
  ) : (
    <div className={cardClass} aria-hidden={ariaHidden}>
      {inner}
    </div>
  )
}

function PartnerRow({ partners }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {partners.map(p => (
        // Partner logos are full-color badges with their own backgrounds, so
        // they are shown as-is (a color filter turns them into solid blocks).
        <div
          key={p.id}
          className="h-16 px-4 bg-white border border-primary-dark-blue/10 rounded-xl flex items-center justify-center shadow-[0_4px_14px_-8px_rgba(6,0,120,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-cyan/50"
        >
          {p.image ? (
            <img src={p.image} alt={p.name} className="h-10 w-auto max-w-[8rem] object-contain" />
          ) : (
            <span className="font-somar text-xs text-primary-dark-blue/60">{p.name}</span>
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
