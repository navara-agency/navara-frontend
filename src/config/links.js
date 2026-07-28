/**
 * Navara external link configuration.
 * All CTA links across the site source from this file —
 * update once here and it propagates everywhere.
 */

export const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || '#'

// Cal.com event path — used by the popup embed on every "Book a Call" button.
// Format: "username/event-slug"  e.g. "omarelsady/discovery-call"
// Override via VITE_CAL_LINK in your .env file.
export const CAL_LINK = import.meta.env.VITE_CAL_LINK || 'omarelsady/discovery-call'

export const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/'

export const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello! I\'d like to learn more about Navara\'s services.'
)

export const WHATSAPP_FULL_URL = `${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`

export const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '+201001234567'
export const PHONE_DISPLAY = import.meta.env.VITE_PHONE_DISPLAY || '+20 100 123 4567'

// Social profiles.
// These fallbacks are the REAL Navara accounts (confirmed 2026-07-28). They
// previously defaulted to linkedin.com/company/navara and instagram.com/navara,
// which belong to other organisations — if the VITE_* vars were ever unset in a
// deploy environment, the footer linked strangers' profiles.
//
// Keep these in sync with the `sameAs` array in index.html: search engines use
// sameAs to resolve which social identities belong to this brand, and a mismatch
// weakens that signal.
export const LINKEDIN_URL  = import.meta.env.VITE_LINKEDIN_URL  || 'https://www.linkedin.com/company/navara-agency'
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/navara_agency'
export const FACEBOOK_URL  = import.meta.env.VITE_FACEBOOK_URL  || 'https://www.facebook.com/navara.agency'
export const TIKTOK_URL    = import.meta.env.VITE_TIKTOK_URL    || 'https://www.tiktok.com/@navara_agency'
export const X_URL         = import.meta.env.VITE_X_URL         || 'https://x.com/Navara_Agency'

// Convenience export for anything that needs to iterate every profile
// (footer icon row, structured data generation, etc).
export const SOCIAL_PROFILES = [
  { name: 'LinkedIn',  url: LINKEDIN_URL },
  { name: 'Instagram', url: INSTAGRAM_URL },
  { name: 'Facebook',  url: FACEBOOK_URL },
  { name: 'TikTok',    url: TIKTOK_URL },
  { name: 'X',         url: X_URL },
]
