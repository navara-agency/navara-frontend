# Navara — Frontend

Public marketing site + admin dashboard for [navara.com](https://navara.com).
React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + i18next.

Backend lives in a separate repo: [`navara-agency/navara-backend`](https://github.com/navara-agency/navara-backend) *(if/when split)*. This frontend talks to it over HTTPS via the URL in `VITE_API_BASE_URL`.

---

## What's in here

```
src/
├── pages/                    # Public site
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Industries.jsx
│   ├── HowWeWork.jsx
│   ├── Contact.jsx
│   └── dashboard/            # Admin dashboard (protected)
│       ├── DashboardLogin.jsx
│       ├── DashboardLayout.jsx
│       ├── DashboardOverview.jsx
│       ├── DashboardLeads.jsx
│       ├── DashboardCaseStudies.jsx
│       ├── DashboardTestimonials.jsx
│       ├── DashboardLogos.jsx
│       ├── DashboardFAQ.jsx
│       ├── DashboardSiteConfig.jsx
│       └── DashboardTranslations.jsx
├── components/
│   ├── layout/               # Navbar, Footer, Section
│   ├── ui/                   # HeroSection, ServicesCards, TestimonialsCarousel, FAQAccordion, …
│   ├── animations/           # FadeUp + reduced-motion helpers
│   ├── dashboard/            # ProtectedRoute
│   └── dev/                  # GeoDevBadge (DEV-only, tree-shaken from prod)
├── contexts/                 # AuthContext, GeoContext
├── hooks/useApi.js           # GET hook + useMutation
├── lib/api.js                # fetch wrapper, JWT, ApiError, uploadWithProgress
├── i18n.js                   # i18next bootstrap (bundled JSON + live API overlay)
├── locales/                  # en.json, ar.json (offline fallback)
├── data/mockDashboard.js     # offline-fallback fixtures used by Home / PlatformLogos
├── config/links.js           # CAL_LINK, WHATSAPP_URL, PHONE_NUMBER defaults
├── styles/globals.css        # Tailwind v4 theme + tokens
└── assets/                   # fonts, brand images
```

---

## Local development

```bash
# 1. Clone + install
git clone https://github.com/navara-agency/navara-frontend.git
cd navara-frontend
npm install --legacy-peer-deps    # multer-storage-cloudinary peer dep ⇒ legacy resolution

# 2. Point at your backend
cp .env.example .env
# Edit .env so VITE_API_BASE_URL points at your running backend
# Default: http://localhost:3001

# 3. Run
npm run dev                       # Vite on :5173
```

Open http://localhost:5173 for the public site, `/dashboard/login` for the admin.

> The dashboard requires the backend to be running. Without it, public pages still render
> (offline-fallback mock data in Home + PlatformLogos), and i18next falls back to the
> bundled JSON locales.

### Useful scripts

```bash
npm run dev        # Vite dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally to verify the prod bundle
npm run lint       # ESLint
```

---

## Production build

```bash
# Set the real backend URL in build-time env
echo "VITE_API_BASE_URL=https://api.navara.com" > .env.production

npm run build
# → dist/ contains index.html + hashed assets, ready to upload
```

Deploy `dist/` contents to:

- **Hostinger Business** → `domains/navara.com/public_html/` (don't forget the SPA `.htaccess`)
- **Vercel** → connect this repo, framework preset = Vite, output dir = `dist`
- Any static host

For Hostinger SPA support, add this `.htaccess` at the root of `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Environment variables

All client-side env vars MUST be `VITE_*`-prefixed (Vite intentionally exposes only those).
Never put a server secret here.

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Where the backend lives | `http://localhost:3001` |
| `VITE_BOOKING_URL` | Legacy fallback Cal.com link if backend can't be reached | `#` |
| `VITE_WHATSAPP_URL` | Fallback WhatsApp wa.me URL when geo isn't loaded | `https://wa.me/...` |
| `VITE_CAL_LINK` | Default Cal.com event path (e.g. `omarelsady/discovery-call`) | placeholder |
| `VITE_PHONE_NUMBER` | E.164 phone fallback for floating tab | placeholder |
| `VITE_PHONE_DISPLAY` | Pretty-formatted phone number | placeholder |
| `VITE_LINKEDIN_URL` | LinkedIn fallback | placeholder |
| `VITE_INSTAGRAM_URL` | Instagram fallback | placeholder |
| `VITE_FORMSPREE_FORM_ID` | Legacy — unused now (form posts to backend) | placeholder |

All of these have sane defaults for local dev. In production the live values come from
`/api/site-config` (set in the dashboard) — these env vars are only the offline fallback.

---

## Backend integration

The frontend expects the backend to serve these endpoints:

| Endpoint | Used by |
|---|---|
| `POST /api/auth/login` | DashboardLogin |
| `POST /api/leads` | Contact form submit (creates lead + Cal.com booking) |
| `GET /api/leads`, `/:id`, `PATCH /:id/status`, `DELETE /:id` | DashboardLeads (admin) |
| `GET /api/geo` | GeoContext (per-market phone/WhatsApp/calLink) |
| `GET /api/site-config`, `PUT /api/site-config` | Footer, FloatingContacts, DashboardSiteConfig |
| `GET /api/translations/:lang`, `PUT /api/translations/:lang` | i18next, DashboardTranslations |
| `GET /api/case-studies/admin`, full CRUD | DashboardCaseStudies |
| `GET /api/testimonials`, `/admin`, full CRUD | Home carousel + DashboardTestimonials |
| `GET /api/logos`, `/admin`, full CRUD | PlatformLogos + DashboardLogos |
| `GET /api/faq`, `/admin`, full CRUD | Home FAQ + DashboardFAQ |
| `GET /api/email-config`, `PUT`, `POST /test` | (Email config UI — TBD) |
| `POST /api/upload` (multipart) | Cover + photo + video uploaders |
| `GET /api/calcom/slots` | Contact form date/time picker |

If you change endpoint shapes, the consumers in `src/pages/dashboard/*` and the public
components are the places to update.

---

## Tech stack notes

- **React 19**, **Vite 8** with HMR
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`. Tokens live in `globals.css`.
- **Framer Motion 12** — `useReducedMotion` respected in every animated component
- **react-router-dom 7** — `BrowserRouter`, lazy-loaded pages
- **i18next 26** + **react-i18next 17** — bundled JSON + live API overlay; `partialBundledLanguages` flow
- **react-hook-form 7** — Contact form
- **lucide-react** — icons

---

## Folder conventions

- `src/components/ui/*.jsx` — presentational components, no API calls
- `src/pages/*.jsx` — route-level, owns API calls via `useApi`
- `src/contexts/*` — single-responsibility per context (Auth, Geo)
- `src/hooks/*` — reusable hook logic only (no JSX)
- `src/lib/*` — pure logic (api client, helpers); no React imports
- All user-facing strings go through `t('...')` — never hardcode in JSX

---

## License

Private. © Navara, 2026.
