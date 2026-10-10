export const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')

// No API URL configured → run entirely on mock data stored in localStorage.
export const USE_MOCK = !API_URL

export const POLL_INTERVAL_MS = 4000
