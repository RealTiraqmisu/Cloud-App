import { useCallback, useEffect, useRef, useState } from 'react'
import { POLL_INTERVAL_MS } from '../config'

// Calls `fetcher` now and every `interval` ms while the tab is visible.
// `key` restarts polling when it changes (e.g. a different orderId).
// `stopWhen(data)` stops polling once it returns true (e.g. order COMPLETED).
export function usePolling(fetcher, { key = '', interval = POLL_INTERVAL_MS, stopWhen } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const stopped = data != null && !!stopWhen?.(data)

  useEffect(() => {
    if (stopped) return undefined
    const tick = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    refresh()
    const id = setInterval(tick, interval)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [key, stopped, interval, refresh])

  return { data, error, loading, refresh, setData }
}
