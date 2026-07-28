// Per-locale, per-route search metadata.
//
// These live outside locales/*.json on purpose: the translation files are
// editable from the dashboard and are keyed for UI copy, whereas these strings
// are targeted at specific search queries and should only change deliberately.
//
// Arabic copy targets the terms that actually carry volume in EG/KSA:
//   وكالة تسويق            3.6k/mo KSA (low competition)
//   شركة تسويق             3.6k/mo KSA, 720/mo EG
//   تسويق الكتروني          1.3k/mo KSA, 1.6k/mo EG
//   التسويق الرقمي          880/mo KSA, 720/mo EG
//   شركة تسويق الكتروني     170/mo KSA, 260/mo EG (high commercial intent)

export const SEO_META = {
  ar: {
    '': {
      title: 'وكالة تسويق رقمي متكاملة في مصر والسعودية | نافارا',
      description:
        'نافارا وكالة تسويق إلكتروني متكاملة تخدم مصر والسعودية: استراتيجية، إبداع، شراء إعلانات، وتحليلات تحت سقف واحد. احجز استشارة مجانية اليوم.',
    },
    about: {
      title: 'من نحن | شركة تسويق إلكتروني في مصر والسعودية | نافارا',
      description:
        'تعرّف على نافارا: فريق تسويق رقمي يعمل مع العلامات التجارية في مصر والسعودية على نمو قابل للقياس، لا وعود عامة. اعرف منهجيتنا وفريقنا ونتائجنا.',
    },
    services: {
      title: 'خدمات التسويق الإلكتروني وإدارة الحملات الإعلانية | نافارا',
      description:
        'خدمات نافارا للتسويق الرقمي: استراتيجية نمو، إدارة حملات وشراء إعلانات، إنتاج محتوى وهوية بصرية، وتحليلات وتتبع تحويلات. حلول متكاملة لمصر والسعودية.',
    },
    industries: {
      title: 'القطاعات التي نخدمها | وكالة تسويق متخصصة | نافارا',
      description:
        'نعمل مع التجارة الإلكترونية، العقارات، الرعاية الصحية، التعليم، والخدمات في مصر والسعودية. اعرف كيف نبني خطة تسويق رقمي مناسبة لقطاعك.',
    },
    'how-we-work': {
      title: 'كيف نعمل | منهجية النمو التسويقي لدى نافارا',
      description:
        'منهجية نافارا في التسويق الرقمي: تشخيص، استراتيجية، تنفيذ، ثم قياس وتحسين مستمر. شفافية كاملة في التقارير ومسؤولية واضحة عن النتائج.',
    },
    contact: {
      title: 'تواصل معنا | احجز استشارة تسويق مجانية | نافارا',
      description:
        'تحدث مع فريق نافارا عن أهداف نموك. احجز استشارة مجانية لمناقشة خطة التسويق الرقمي المناسبة لعلامتك التجارية في مصر أو السعودية.',
    },
  },
  en: {
    '': {
      title: 'Integrated Growth Marketing Agency in Egypt & Saudi Arabia | Navara',
      description:
        "Navara is Egypt and Saudi Arabia's integrated growth marketing agency — strategy, creative, media buying and analytics under one roof. Book a free consultation.",
    },
    about: {
      title: 'About Navara | Growth Marketing Agency in Egypt & KSA',
      description:
        'Meet the team behind Navara — a growth marketing agency working with brands across Egypt and Saudi Arabia on measurable outcomes, not vanity metrics.',
    },
    services: {
      title: 'Digital Marketing Services — Strategy, Media Buying & Analytics | Navara',
      description:
        'Growth strategy, paid media buying, creative and content production, and analytics with full conversion tracking. One integrated team for Egypt and Saudi Arabia.',
    },
    industries: {
      title: 'Industries We Serve | Navara Growth Marketing',
      description:
        'We work with e-commerce, real estate, healthcare, education and service brands across Egypt and Saudi Arabia. See how we tailor growth plans by sector.',
    },
    'how-we-work': {
      title: 'How We Work | Our Growth Marketing Process | Navara',
      description:
        'Diagnose, strategise, execute, then measure and iterate. See how Navara runs growth engagements, what reporting looks like, and how we stay accountable.',
    },
    contact: {
      title: 'Contact Navara | Book a Free Growth Consultation',
      description:
        'Talk to the Navara team about your growth goals. Book a free consultation to scope the right digital marketing plan for your brand in Egypt or Saudi Arabia.',
    },
  },
}

export function metaFor(locale, route = '') {
  const table = SEO_META[locale] ?? SEO_META.ar
  return table[route] ?? table['']
}
