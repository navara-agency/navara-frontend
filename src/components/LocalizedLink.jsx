import { Link, useLocation } from 'react-router-dom'
import { langFromPath, localizedPath } from '../lib/routes'

/**
 * <Link> that keeps navigation inside the visitor's current language.
 *
 * Write `to="/contact"` and an English visitor on /en/services goes to
 * /en/contact rather than being silently dropped onto the Arabic page.
 * Hashes are preserved: `to="/contact#contact-form"` works as expected.
 *
 * Anything still using a bare react-router <Link> keeps working — LanguageSync
 * in App.jsx catches the resulting language flip and corrects it — but that
 * costs an extra client-side redirect, so prefer this component for internal
 * links.
 */
export default function LocalizedLink({ to, ...rest }) {
  const { pathname } = useLocation()
  const lang = langFromPath(pathname)

  const [rawPath, hash = ''] = String(to).split('#')
  const target = localizedPath(rawPath || '/', lang) + (hash ? `#${hash}` : '')

  return <Link to={target} {...rest} />
}
