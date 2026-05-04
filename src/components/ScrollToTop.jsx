import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      let frameId
      let attempts = 0
      const targetId = decodeURIComponent(hash.slice(1))

      const scrollToHash = () => {
        const target = document.getElementById(targetId)

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }

        attempts += 1
        if (attempts < 20) {
          frameId = window.requestAnimationFrame(scrollToHash)
        }
      }

      frameId = window.requestAnimationFrame(scrollToHash)
      return () => window.cancelAnimationFrame(frameId)
    }

    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
