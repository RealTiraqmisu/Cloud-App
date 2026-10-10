// Every page imports the API from here, never from mock.js / http.js directly.
// Set VITE_API_URL in .env to switch from mock data to the real backend.
import { USE_MOCK } from '../config'
import * as http from './http'
import * as mock from './mock'

export { ApiError } from './errors'

export const api = USE_MOCK ? mock : http
