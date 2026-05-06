import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/ui/HeroSection'
import PlatformLogos from '../components/ui/PlatformLogos'
import WhoWeAreSection from '../components/ui/WhoWeAreSection'
import ServicesCards from '../components/ui/ServicesCards'
import TestimonialsCarousel from '../components/ui/TestimonialsCarousel'
import RiskReversal from '../components/ui/RiskReversal'
import ProcessTimeline from '../components/ui/ProcessTimeline'
import FAQAccordion from '../components/ui/FAQAccordion'
import { useApi } from '../hooks/useApi'
import { TESTIMONIALS as FALLBACK_TESTIMONIALS } from '../data/mockDashboard'

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
)

// Carousel shape: { id, clientName, clientTitle, clientPhoto, quote, resultsBadge, videoUrl }
// Backend testimonials shape: { id, quote, author, title, company, photo, resultsBadge, videoUrl }
function mapApiTestimonialToCarousel(item) {
  return {
    id: item.id,
    clientName: item.author,
    clientTitle: [item.title, item.company].filter(Boolean).join(', '),
    clientPhoto: item.photo || null,
    quote: item.quote,
    resultsBadge: item.resultsBadge || null,
    videoUrl: item.videoUrl || null,
    thumbnailUrl: item.thumbnailUrl || null,
    rating: typeof item.rating === 'number' ? item.rating : 5,
    industry: item.industry || null,
  }
}

const PLACEHOLDER_TESTIMONIALS = [
  {
    id: 'tp1',
    clientName: 'Sarah Ahmed',
    clientTitle: 'E-commerce Owner',
    clientPhoto: null,
    quote: 'Navara helped us grow our online store revenue by 40% in just 3 months.',
    resultsBadge: '+40% Revenue',
    videoUrl: null,
  },
  {
    id: 'tp2',
    clientName: 'Mohammed Al-Rashid',
    clientTitle: 'Marketing Director',
    clientPhoto: null,
    quote: 'The integrated growth system gave us clarity on exactly where to invest our budget.',
    resultsBadge: null,
    videoUrl: null,
  },
  {
    id: 'tp3',
    clientName: 'Fatima Hassan',
    clientTitle: 'Founder, Beauty Brand',
    clientPhoto: null,
    quote: 'Professional, results-driven, and always accountable. Best agency we have worked with.',
    resultsBadge: null,
    videoUrl: null,
  },
  {
    id: 'tp4',
    clientName: 'Khalid Al-Mansouri',
    clientTitle: 'CEO, Real Estate Developer',
    clientPhoto: null,
    quote: 'From zero digital presence to 200+ qualified leads a month. The Navara team delivered beyond expectations.',
    resultsBadge: '200+ Leads/mo',
    videoUrl: null,
  },
]


// Static fallback — used only when /api/faq returns nothing or errors
const FALLBACK_FAQ_ITEMS = [
  { id: 'faq1', questionKey: 'home.faq.item1.q', answerKey: 'home.faq.item1.a' },
  { id: 'faq2', questionKey: 'home.faq.item2.q', answerKey: 'home.faq.item2.a' },
  { id: 'faq3', questionKey: 'home.faq.item3.q', answerKey: 'home.faq.item3.a' },
  { id: 'faq4', questionKey: 'home.faq.item4.q', answerKey: 'home.faq.item4.a' },
  { id: 'faq5', questionKey: 'home.faq.item5.q', answerKey: 'home.faq.item5.a' },
  { id: 'faq6', questionKey: 'home.faq.item6.q', answerKey: 'home.faq.item6.a' },
  { id: 'faq7', questionKey: 'home.faq.item7.q', answerKey: 'home.faq.item7.a' },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const goToContact = () => navigate('/contact#contact-form')

  // FAQ — fetch from backend; map current language to questionEn/Ar; fall back to translation-key list.
  const { data: apiFaq, error: faqError } = useApi('/api/faq')
  const isAr = i18n.language === 'ar'
  const apiFaqItems = Array.isArray(apiFaq)
    ? apiFaq
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((row) => ({
          id: `api-${row.id}`,
          question: isAr ? (row.questionAr || row.questionEn) : (row.questionEn || row.questionAr),
          answer:   isAr ? (row.answerAr   || row.answerEn)   : (row.answerEn   || row.answerAr),
        }))
    : null
  const FAQ_ITEMS = (apiFaqItems && apiFaqItems.length > 0) ? apiFaqItems : FALLBACK_FAQ_ITEMS

  // Fetch testimonials from the backend; fall back to mock then translation array.
  const { data: apiTestimonials, error: testimonialsError } = useApi('/api/testimonials')
  const fallbackPublished = FALLBACK_TESTIMONIALS.filter(t => t.status === 'published')
  const apiList = Array.isArray(apiTestimonials) ? apiTestimonials : null
  const sourceList = (apiList && apiList.length > 0)
    ? apiList
    : (testimonialsError && fallbackPublished.length > 0 ? fallbackPublished : null)

  const localeTestimonials = t('homeV2.testimonials.items', { returnObjects: true })

  const CAROUSEL_TESTIMONIALS = sourceList
    ? sourceList.map(mapApiTestimonialToCarousel)
    : Array.isArray(localeTestimonials)
      ? localeTestimonials
      : PLACEHOLDER_TESTIMONIALS

  return (
    <PageWrapper>
      <Helmet>
        <title>{t('home.seo.title')}</title>
        <meta name="description" content={t('home.seo.description')} />
        <meta property="og:title" content={t('home.seo.title')} />
        <meta property="og:description" content={t('home.seo.description')} />
        <link rel="canonical" href="https://navaraagency.com/" />
      </Helmet>

      <HeroSection onCtaClick={goToContact} />

      <PlatformLogos />

      <WhoWeAreSection />

      <ServicesCards onCtaClick={goToContact} />

      <ProcessTimeline onCtaClick={goToContact} />

      <TestimonialsCarousel testimonials={CAROUSEL_TESTIMONIALS} />

      <RiskReversal onCtaClick={goToContact} />

      {/* FAQ */}
      <section id="faq" className="py-24 bg-bg-light" aria-label="Frequently asked questions">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <h2
            className="font-handicrafts font-semibold text-primary-dark-blue text-center mb-10 whitespace-nowrap"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            {t('homeV2.faq.sectionHeading')}
          </h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </PageWrapper>
  )
}
