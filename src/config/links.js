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

export const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com/company/navara'
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/navara'
