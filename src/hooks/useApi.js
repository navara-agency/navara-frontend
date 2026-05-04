import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../lib/api'

// Lightweight GET hook. Returns { data, loading, error, refetch }.
// Pass `deps` to refetch when external state changes (filters, etc).
export function useApi(path, { deps = [], skip = false, query, auth } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)
  const aborted = useRef(false)

  const refetch = useCallback(async () => {
    if (skip || !path) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.get(path, { query, auth })
      if (!aborted.current) setData(result)
    } catch (err) {
      if (!aborted.current) setError(err)
    } finally {
      if (!aborted.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip, JSON.stringify(query), auth])

  useEffect(() => {
    aborted.current = false
    refetch()
    return () => { aborted.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip, JSON.stringify(query), auth, ...deps])

  return { data, loading, error, refetch, setData }
}

// Convenience for mutations — returns { run, loading, error, result }.
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const run = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn(...args)
      setResult(res)
      return res
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { run, loading, error, result }
}
