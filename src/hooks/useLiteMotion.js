import { useSyncExternalStore } from 'react'
import { useReducedMotion } from 'framer-motion'

// Mobile/tablet viewports get the "lite" treatment: decorative infinite
// animations (orbs, particles, shimmers, glow pulses) are disabled because
// running dozens of them saturates the main thread / GPU on those devices.
// Entrance animations stay enabled — only prefers-reduced-motion turns
// everything off.
const QUERY = '(max-width: 1023px)'

function subscribe(callback) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

export default function useLiteMotion() {
  const reduced = useReducedMotion()
  const isSmallViewport = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return reduced || isSmallViewport
}
