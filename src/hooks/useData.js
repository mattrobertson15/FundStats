import { useState, useEffect, useCallback } from 'react'
import { raises as sampleRaises, vcFirms as sampleVCFirms } from '../data/sampleData.js'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

function useFetch(fetchFn, fallback) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      // Fall back to sample data when API isn't running
      setData(fallback)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

export function useRaises() {
  return useFetch(
    () => apiFetch('/api/raises'),
    sampleRaises,
  )
}

export function useVCFirms() {
  return useFetch(
    () => apiFetch('/api/vcs'),
    sampleVCFirms,
  )
}
