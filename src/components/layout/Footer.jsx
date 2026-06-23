import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Mail } from 'lucide-react'

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
import { WHATSAPP_FULL_URL, WHATSAPP_MESSAGE, LINKEDIN_URL, INSTAGRAM_URL } from '../../config/links'
import PhotoBackdrop from '../ui/PhotoBackdrop'
import { useGeo } from '../../contexts/GeoContext'
import { useApi } from '../../hooks/useApi'

function buildWhatsappUrl(number) {
  const digits = (number || '').replace(/[^\d]/g, '')
  return digits ? `https://wa.me/${digits}?text=${WHATSAPP_MESSAGE}` : null
}

export default function Footer() {
  const { t } = useTranslation()
  const { config: geoConfig } = useGeo()
  const { data: siteConfig } = useApi('/api/site-config')

  const whatsappUrl = buildWhatsappUrl(geoConfig?.whatsapp) || WHATSAPP_FULL_URL
  const linkedinUrl = siteConfig?.global?.linkedinUrl || LINKEDIN_URL
  const instagramUrl = siteConfig?.global?.instagramUrl || INSTAGRAM_URL
  const contactEmail = siteConfig?.global?.emailContact || t('footer.connect.email')

  return (
    <footer className="bg-primary-dark-blue text-gray-400 relative overflow-hidden">
      <PhotoBackdrop src="/brand/AbstractBG/ab1.webp" opacity={0.04} />
      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-end pe-8 pointer-events-none select-none" aria-hidden="true">
        <img src="/brand/navara-logo-icon-white.png" alt="" className="h-48 w-auto opacity-[0.07]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 md:px-8 py-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Logo + tagline */}
          <div>
            <img
              src="/brand/navara-logo-icon-white.png"
              alt="Navara"
              className="h-10 w-auto mb-4"
              width="40"
              height="40"
              loading="lazy"
            />
            <p className="font-somar text-sm font-medium text-white mb-2">
              {t('footer.tagline')}
            </p>
            <p className="font-somar text-sm">{t('footer.description')}</p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="font-somar font-semibold text-white text-sm uppercase tracking-wider mb-4">
              {t('footer.services.heading')}
            </h3>
            <ul className="space-y-2 text-sm font-somar">
              {[
                'brandPresence',
                'performance',
                'integrated',
                'creative',
                'seo',
              ].map((key) => (
                <li key={key}>
                  <Link
                    to="/services"
                    className="hover:text-primary-cyan transition-colors"
                  >
                    {t(`footer.services.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="font-somar font-semibold text-white text-sm uppercase tracking-wider mb-4">
              {t('footer.company.heading')}
            </h3>
            <ul className="space-y-2 text-sm font-somar">
              {[
                { key: 'about', href: '/about' },
                { key: 'industries', href: '/industries' },
                { key: 'howWeWork', href: '/how-we-work' },
                { key: 'contact', href: '/contact' },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link to={href} className="hover:text-primary-cyan transition-colors">
                    {t(`footer.company.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h3 className="font-somar font-semibold text-white text-sm uppercase tracking-wider mb-4">
              {t('footer.connect.heading')}
            </h3>
            <ul className="space-y-3 text-sm font-somar">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-white hover:text-primary-cyan transition-colors font-medium"
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary-cyan/20 transition-colors">
                    <MessageCircle size={15} aria-hidden="true" />
                  </span>
                  {t('footer.connect.whatsapp')}
                </a>
              </li>
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 hover:text-primary-cyan transition-colors"
                  aria-label={`${t('footer.connect.linkedin')} (opens in new tab)`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary-cyan/20 transition-colors">
                    <LinkedinIcon size={15} />
                  </span>
                  {t('footer.connect.linkedin')}
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 hover:text-primary-cyan transition-colors"
                  aria-label={`${t('footer.connect.instagram')} (opens in new tab)`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary-cyan/20 transition-colors">
                    <InstagramIcon size={15} />
                  </span>
                  {t('footer.connect.instagram')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="group flex items-center gap-2 hover:text-primary-cyan transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary-cyan/20 transition-colors">
                    <Mail size={15} aria-hidden="true" />
                  </span>
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs font-somar">
          <span>{t('footer.copyright')}</span>
          <span className="text-gray-500 text-end">{t('footer.adSpendNote')}</span>
        </div>
      </div>
    </footer>
  )
}
