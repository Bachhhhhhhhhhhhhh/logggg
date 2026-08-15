import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import { savePrefs } from './lib/prefs'
import { useMemoryStore } from './store'

useMemoryStore.subscribe((s) => {
  savePrefs({
    bookmarks: s.bookmarks,
    notes: s.notes,
    hopDepth: s.hopDepth,
    minLinkWeight: s.minLinkWeight,
    vizMode: s.vizMode,
    labelMode: s.labelMode,
    autoRotate: s.autoRotate,
    particles: s.particles,
    graphMode: s.graphMode,
  })
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
