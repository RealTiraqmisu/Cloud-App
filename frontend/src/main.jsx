import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (Thai + Latin subsets only): Anuphan for UI/headings, Plex Sans Thai Looped for body.
import '@fontsource-variable/anuphan/wght.css'
import '@fontsource/ibm-plex-sans-thai-looped/thai-400.css'
import '@fontsource/ibm-plex-sans-thai-looped/thai-500.css'
import '@fontsource/ibm-plex-sans-thai-looped/thai-600.css'
import '@fontsource/ibm-plex-sans-thai-looped/latin-400.css'
import '@fontsource/ibm-plex-sans-thai-looped/latin-500.css'
import '@fontsource/ibm-plex-sans-thai-looped/latin-600.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
