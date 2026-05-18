import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Curated country list — MENA-first, with major Western markets for expats / global leads.
// dialCode includes the leading "+". `flag` uses Unicode regional-indicator emoji; modern
// browsers/OSes render an actual flag, older Windows renders the ISO letters (still meaningful).
const COUNTRIES = [
  { iso: 'EG', name: 'Egypt',          flag: '🇪🇬', dial: '+20',  trunk: '0' },
  { iso: 'SA', name: 'Saudi Arabia',   flag: '🇸🇦', dial: '+966', trunk: '0' },
  { iso: 'AE', name: 'UAE',            flag: '🇦🇪', dial: '+971', trunk: '0' },
  { iso: 'QA', name: 'Qatar',          flag: '🇶🇦', dial: '+974', trunk: '' },
  { iso: 'KW', name: 'Kuwait',         flag: '🇰🇼', dial: '+965', trunk: '' },
  { iso: 'BH', name: 'Bahrain',        flag: '🇧🇭', dial: '+973', trunk: '' },
  { iso: 'OM', name: 'Oman',           flag: '🇴🇲', dial: '+968', trunk: '' },
  { iso: 'JO', name: 'Jordan',         flag: '🇯🇴', dial: '+962', trunk: '0' },
  { iso: 'LB', name: 'Lebanon',        flag: '🇱🇧', dial: '+961', trunk: '0' },
  { iso: 'IQ', name: 'Iraq',           flag: '🇮🇶', dial: '+964', trunk: '0' },
  { iso: 'MA', name: 'Morocco',        flag: '🇲🇦', dial: '+212', trunk: '0' },
  { iso: 'TN', name: 'Tunisia',        flag: '🇹🇳', dial: '+216', trunk: '' },
  { iso: 'DZ', name: 'Algeria',        flag: '🇩🇿', dial: '+213', trunk: '0' },
  { iso: 'LY', name: 'Libya',          flag: '🇱🇾', dial: '+218', trunk: '0' },
  { iso: 'SD', name: 'Sudan',          flag: '🇸🇩', dial: '+249', trunk: '0' },
  { iso: 'YE', name: 'Yemen',          flag: '🇾🇪', dial: '+967', trunk: '0' },
  { iso: 'SY', name: 'Syria',          flag: '🇸🇾', dial: '+963', trunk: '0' },
  { iso: 'PS', name: 'Palestine',      flag: '🇵🇸', dial: '+970', trunk: '0' },
  { iso: 'TR', name: 'Turkey',         flag: '🇹🇷', dial: '+90',  trunk: '0' },
  { iso: 'US', name: 'United States',  flag: '🇺🇸', dial: '+1',   trunk: '' },
  { iso: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44',  trunk: '0' },
  { iso: 'DE', name: 'Germany',        flag: '🇩🇪', dial: '+49',  trunk: '0' },
  { iso: 'FR', name: 'France',         flag: '🇫🇷', dial: '+33',  trunk: '0' },
  { iso: 'IT', name: 'Italy',          flag: '🇮🇹', dial: '+39',  trunk: '' },
  { iso: 'ES', name: 'Spain',          flag: '🇪🇸', dial: '+34',  trunk: '' },
  { iso: 'NL', name: 'Netherlands',    flag: '🇳🇱', dial: '+31',  trunk: '0' },
  { iso: 'SE', name: 'Sweden',         flag: '🇸🇪', dial: '+46',  trunk: '0' },
  { iso: 'CH', name: 'Switzerland',    flag: '🇨🇭', dial: '+41',  trunk: '0' },
  { iso: 'IN', name: 'India',          flag: '🇮🇳', dial: '+91',  trunk: '0' },
  { iso: 'PK', name: 'Pakistan',       flag: '🇵🇰', dial: '+92',  trunk: '0' },
]

// Sort dial-codes longest-first so "+971" matches before "+97" / "+9".
const DIAL_LOOKUP = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)

function findCountryByDial(input) {
  if (!input || input[0] !== '+') return null
  for (const c of DIAL_LOOKUP) {
    if (input.startsWith(c.dial)) return c
  }
  return null
}

function findCountryByIso(iso) {
  if (!iso) return null
  return COUNTRIES.find((c) => c.iso === iso) || null
}

// Strip everything except digits.
function digitsOnly(s) {
  return String(s || '').replace(/\D+/g, '')
}

/**
 * Compose the E.164-ish value the form should submit: dial code + local digits, drop a
 * single leading trunk "0" if the country uses one (e.g., Egyptian "010..." becomes "+2010...").
 */
function composeE164(country, local) {
  let digits = digitsOnly(local)
  if (country.trunk && digits.startsWith(country.trunk)) {
    digits = digits.slice(country.trunk.length)
  }
  return `${country.dial}${digits}`
}

/**
 * IntlPhoneInput — flag + dial-code button + local-number input. Auto-detects the country
 * when a user types/pastes a value beginning with "+". Emits the full E.164 value via onChange.
 *
 * Props:
 *   value         — current E.164 string (e.g. "+201234567890")
 *   onChange(val) — called with the new E.164 string whenever country or local digits change
 *   defaultIso    — ISO2 to start on (e.g. "EG" or "SA"); falls back to "EG"
 *   error         — boolean, shows red border
 *   id, placeholder, ...inputProps — passed to the inner <input>
 */
export default function IntlPhoneInput({
  value = '',
  onChange,
  defaultIso = 'EG',
  error,
  id,
  placeholder,
  ...inputProps
}) {
  // Country: try to recover from `value` first (so the picker stays consistent across re-renders),
  // otherwise fall back to defaultIso → Egypt.
  const initialCountry = useMemo(() => {
    return findCountryByDial(value) || findCountryByIso(defaultIso) || COUNTRIES[0]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [country, setCountry] = useState(initialCountry)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  // Local input string the user actually sees (digits + optional spaces). When `value` starts
  // with the current country's dial code we strip it for display; otherwise mirror it verbatim
  // so the user can type freely.
  const initialLocal = useMemo(() => {
    if (value && value.startsWith(country.dial)) {
      return value.slice(country.dial.length)
    }
    return value || ''
  }, [country.dial, value])

  const [local, setLocal] = useState(initialLocal)

  // Keep defaultIso in sync once geo resolves — only if the user hasn't typed anything yet,
  // so we never clobber their input. We trust `value` as the user-typed indicator.
  useEffect(() => {
    if (!value) {
      const next = findCountryByIso(defaultIso)
      if (next && next.iso !== country.iso) setCountry(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultIso])

  // Click-outside to close the dropdown.
  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function emit(nextCountry, nextLocal) {
    if (typeof onChange === 'function') {
      onChange(composeE164(nextCountry, nextLocal))
    }
  }

  function handleLocalChange(e) {
    const raw = e.target.value
    // If the user pasted/typed a "+" prefix, treat it as a full E.164 and auto-detect.
    if (raw.startsWith('+')) {
      const detected = findCountryByDial(raw)
      if (detected) {
        const rest = raw.slice(detected.dial.length)
        setCountry(detected)
        setLocal(rest)
        emit(detected, rest)
        return
      }
      // "+" but unknown prefix — keep as-is so they can keep typing
      setLocal(raw)
      if (typeof onChange === 'function') onChange(raw)
      return
    }
    setLocal(raw)
    emit(country, raw)
  }

  function pickCountry(c) {
    setCountry(c)
    setOpen(false)
    setSearch('')
    emit(c, local)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q) ||
      c.dial.includes(q)
    )
  }, [search])

  const borderClass = error
    ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/30'
    : 'border-gray-200 focus-within:border-primary-cyan focus-within:ring-primary-cyan/30'

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-stretch w-full bg-white border rounded-md focus-within:ring-1 transition-colors ${borderClass}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-3 border-e border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-s-md"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-lg leading-none" aria-hidden="true">{country.flag}</span>
          <span className="font-somar text-sm text-text-dark font-medium">{country.dial}</span>
          <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={local}
          onChange={handleLocalChange}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-3 font-somar text-sm bg-transparent focus:outline-none rounded-e-md"
          {...inputProps}
        />
      </div>

      {open && (
        <div
          className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full px-3 py-2 text-sm font-somar border border-gray-200 rounded focus:outline-none focus:border-primary-cyan"
              autoFocus
            />
          </div>
          <ul>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 font-somar">No matches</li>
            ) : (
              filtered.map((c) => (
                <li key={c.iso}>
                  <button
                    type="button"
                    onClick={() => pickCountry(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left font-somar text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                      c.iso === country.iso ? 'bg-primary-cyan/5' : ''
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden="true">{c.flag}</span>
                    <span className="flex-1 text-text-dark truncate">{c.name}</span>
                    <span className="text-gray-400">{c.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
