import { useEffect } from 'react'
import { AtlasOverlay } from './components/AtlasOverlay'
import { BootScreen } from './components/BootScreen'
import { CommunitiesView } from './components/CommunitiesView'
import { DevWorkView } from './components/DevWorkView'
import { GraphView } from './components/GraphView'
import { Header } from './components/Header'
import { HelpOverlay } from './components/HelpOverlay'
import { IconRail } from './components/IconRail'
import { ImportModal } from './components/ImportModal'
import { JobsView } from './components/JobsView'
import { KnowledgeView } from './components/KnowledgeView'
import { SearchBar } from './components/SearchBar'
import { SettingsPanel } from './components/SettingsPanel'
import { Ticker } from './components/Ticker'
import { ToastHost } from './components/ToastHost'
import { startLiveEngine } from './lib/live-engine'
import { useMemoryStore } from './store'

export default function App() {
  const tab = useMemoryStore((s) => s.tab)
  const cinema = useMemoryStore((s) => s.cinema)
  const drawerNodeId = useMemoryStore((s) => s.drawerNodeId)

  useEffect(() => {
    const m = location.hash.match(/n=([a-z0-9_]+)/i)
    if (m?.[1]) useMemoryStore.getState().openNode(m[1])
  }, [])

  useEffect(() => startLiveEngine(), [])

  useEffect(() => {
    if (drawerNodeId) history.replaceState(null, '', `#n=${drawerNodeId}`)
  }, [drawerNodeId])

  return (
    <div className="flex h-full flex-col bg-paper text-ink">
      <BootScreen />
      {!cinema && <Header />}
      <div className="flex min-h-0 flex-1">
        {!cinema && <IconRail />}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="relative min-h-0 flex-1">
            {tab === 'graph' && <GraphView />}
            {tab === 'knowledge' && <KnowledgeView />}
            {tab === 'communities' && <CommunitiesView />}
            {tab === 'devwork' && <DevWorkView />}
            {tab === 'jobs' && <JobsView />}
          </main>
          {!cinema && <Ticker />}
        </div>
      </div>
      {cinema && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-40 -translate-x-1/2 font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
          Esc exit cinema
        </div>
      )}
      <SearchBar />
      <HelpOverlay />
      <SettingsPanel />
      <AtlasOverlay />
      <ImportModal />
      <ToastHost />
    </div>
  )
}
