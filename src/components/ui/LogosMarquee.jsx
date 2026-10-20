import { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

// Logo names uploaded through the dashboard are often just the file name
// ("Asset 44@4x 8"). Those make useless alt text, so fall back to a generic label.
const FILE_NAME_RE = /^asset\s*\d+|@\dx|\.(png|jpe?g|svg|webp)$/i
function useLogoAlt(kind) {
  const { t } = useTranslation()
  return (logo) => (logo.name && !FILE_NAME_RE.test(logo.name.trim()))
    ? logo.name
    : t(kind === 'partner' ? 'homeV2.logos.partnerAlt' : 'homeV2.logos.clientAlt')
}

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
        {partnerLogos.length > 0 && <PartnerRow partners={partnerLogos} clientCount={6} />}
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
      {partnerLogos.length > 0 && <PartnerRow partners={partnerLogos} clientCount={clientLogos.length} />}
    </div>
  )
}

function LogoItem({ logo, logoSize, 'aria-hidden': ariaHidden }) {
  const [imgFailed, setImgFailed] = useState(false)
  const altFor = useLogoAlt('client')

  // Client logos are uploaded as white transparent PNGs, so each one sits on a
  // brand-navy card. The filter forces any colored fallback logo to white too.
  const content = logo.image && !imgFailed ? (
    <img
      src={logo.image}
      alt={altFor(logo)}
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
    'group relative flex-shrink-0 mx-2 md:mx-3 w-32 h-20 md:w-48 md:h-28 px-4 md:px-5 flex items-center justify-center overflow-hidden rounded-xl md:rounded-2xl ' +
    'bg-gradient-to-br from-primary-dark-blue to-[#4A12A8] border border-white/10 ' +
    'shadow-[0_8px_24px_-12px_rgba(43, 14, 116,0.55)] transition-all duration-300 ease-out ' +
    'hover:-translate-y-1 hover:border-primary-cyan/50 hover:shadow-[0_14px_32px_-12px_rgba(33, 211, 251,0.45)]'

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
      aria-label={altFor(logo)}
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

// Second marquee row for platform/tool logos. Same card size, radius, gap and
// speed (px/s) as the client row above, but white cards (many tool logos are
// dark and would vanish on navy) and it runs in the opposite direction.
function PartnerRow({ partners, clientCount }) {
  // The client track loops 21 logos in 30s; scale the duration by item count so
  // both rows move at the same speed whatever the number of logos.
  const duration = `${((30 * partners.length) / Math.max(clientCount, 1)).toFixed(1)}s`
  return (
    <div className="marquee-wrapper marquee-wrapper--partners py-3 mt-8" dir="ltr">
      <div className="marquee-track marquee-track--reverse" style={{ animationDuration: duration }}>
        {partners.map(p => <PartnerItem key={p.id} logo={p} />)}
        {partners.map(p => <PartnerItem key={`dup-${p.id}`} logo={p} duplicate />)}
      </div>
    </div>
  )
}

function PartnerItem({ logo, duplicate = false }) {
  const altFor = useLogoAlt('partner')
  // Partner logos are full-color badges with their own backgrounds, so
  // they are shown as-is (a color filter turns them into solid blocks).
  return (
    <div
      className={'flex-shrink-0 mx-2 md:mx-3 w-32 h-20 md:w-48 md:h-28 px-4 md:px-5 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-primary-dark-blue/10 ' +
        'shadow-[0_4px_14px_-8px_rgba(43, 14, 116,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-cyan/50'}
      aria-hidden={duplicate || undefined}
      data-marquee-dup={duplicate || undefined}
    >
      {logo.image ? (
        <img src={logo.image} alt={duplicate ? '' : altFor(logo)} className="max-h-9 md:max-h-14 max-w-full w-auto object-contain" />
      ) : (
        <span className="font-somar text-xs text-primary-dark-blue/60">{logo.name}</span>
      )}
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
