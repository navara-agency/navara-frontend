import { useState } from 'react'
import { useGeo, clearGeoCache } from '../../contexts/GeoContext'
import { useApi } from '../../hooks/useApi'

/**
 * Dev-only floating badge: shows the current geo response + the KSA/EG site-config blocks,
 * so we can tell at a glance whether the API is responding and whether the dashboard fields
 * are actually populated.
 *
 * Mounted only when import.meta.env.DEV is true (Vite drops it in production builds).
 */
export default function GeoDevBadge() {
  const { market, config: geoConfig, loading, debug } = useGeo()
  const { data: siteConfig } = useApi('/api/site-config')
  const [open, setOpen] = useState(false)

  if (!import.meta.env.DEV) return null

  const eg = siteConfig?.eg
  const ksa = siteConfig?.ksa
  const ksaEmpty = !ksa || (!ksa.phone && !ksa.whatsapp && !ksa.calLink)

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: open ? '10px 12px' : '6px 10px',
        borderRadius: 8,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        maxWidth: open ? 360 : 'unset',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setOpen((o) => !o)}
      title="Click to expand geo + site-config debug"
    >
      <div>
        <strong>geo:</strong>{' '}
        {loading ? 'loading…' : (
          <span style={{ color: market === 'KSA' ? '#34d399' : '#fbbf24' }}>{market}</span>
        )}
        {!open && <span style={{ marginLeft: 8, opacity: 0.6 }}>▾</span>}
      </div>
      {open && (
        <div style={{ marginTop: 8, lineHeight: 1.5 }}>
          <div><strong>diagnostics:</strong></div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(debug, null, 2)}</pre>
          <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
          <div><strong>response config:</strong></div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(geoConfig, null, 2)}</pre>
          <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
          <div><strong>site_config eg:</strong></div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(eg, null, 2)}</pre>
          <div style={{ marginTop: 6 }}>
            <strong>site_config ksa:</strong>
            {ksaEmpty && (
              <span style={{ color: '#f87171', marginInlineStart: 6 }}>
                ⚠ KSA fields look empty — fill them in /dashboard/site-config and save
              </span>
            )}
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(ksa, null, 2)}</pre>
          <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
          <div style={{ opacity: 0.7, fontSize: 10 }}>
            Force market: <a href="?geo=KSA" style={{ color: '#7dd3fc' }}>?geo=KSA</a>{' · '}
            <a href="?geo=Egypt" style={{ color: '#7dd3fc' }}>?geo=Egypt</a>{' · '}
            <a href={window.location.pathname} style={{ color: '#7dd3fc' }}>clear</a>
          </div>
          <div style={{ marginTop: 4, fontSize: 10 }}>
            <a
              href="#"
              style={{ color: '#fbbf24' }}
              onClick={(e) => { e.preventDefault(); clearGeoCache(); window.location.reload() }}
            >
              Clear session cache &amp; re-detect
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
