import { useEffect } from 'react'
import { CATEGORY_META } from '../lib/categories'
import { useMemoryStore } from '../store'

const SUGGESTIONS = [
  'vessel delay customer notice',
  'invoice discrepancy rate card',
  'document extraction packing list',
  'client 66673 hold release',
]

const COMMANDS = [
  {
    label: 'Heat · 16-week pulse',
    run: () => {
      useMemoryStore.getState().setVizMode('heat')
      useMemoryStore.getState().setPlaying(true)
      useMemoryStore.getState().setTab('graph')
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Cluster coloring',
    run: () => {
      useMemoryStore.getState().setVizMode('community')
      useMemoryStore.getState().setTab('graph')
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Cinematic field',
    run: () => {
      useMemoryStore.getState().setCinema(true)
      useMemoryStore.getState().setTab('graph')
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Open atlas',
    run: () => {
      useMemoryStore.getState().setAtlasOpen(true)
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Tour top hubs',
    run: () => {
      useMemoryStore.getState().setTab('graph')
      useMemoryStore.getState().setTouring(true)
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Follow live stream',
    run: () => {
      useMemoryStore.getState().setFollowLive(true)
      useMemoryStore.getState().setLive(true)
      useMemoryStore.getState().setSidePanel('live')
      useMemoryStore.getState().setTab('graph')
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
  {
    label: 'Settings',
    run: () => {
      useMemoryStore.getState().setSettingsOpen(true)
      useMemoryStore.getState().setSearchOpen(false)
    },
  },
]

export function SearchBar() {
  const open = useMemoryStore((s) => s.searchOpen)
  const setSearchOpen = useMemoryStore((s) => s.setSearchOpen)
  const query = useMemoryStore((s) => s.query)
  const setQuery = useMemoryStore((s) => s.setQuery)
  const runSearch = useMemoryStore((s) => s.runSearch)
  const clearSearch = useMemoryStore((s) => s.clearSearch)
  const searchHits = useMemoryStore((s) => s.searchHits)
  const searchActive = useMemoryStore((s) => s.searchActive)
  const openNode = useMemoryStore((s) => s.openNode)
  const setTab = useMemoryStore((s) => s.setTab)
  const nodes = useMemoryStore((s) => s.nodes)

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => document.getElementById('memory-search')?.focus(), 30)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useMemoryStore.getState().searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pt-6 pb-[max(12px,env(safe-area-inset-bottom))] md:items-start md:px-4 md:pt-[14vh] md:pb-0">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => setSearchOpen(false)}
      />
      <div className="relative max-h-[86dvh] w-full max-w-2xl overflow-hidden rounded-2xl border border-accent/20 bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            runSearch()
            setTab('graph')
          }}
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M16 16l4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              id="memory-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memory — describe what you need..."
              className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
            />
            <kbd className="font-mono text-[10px] text-faint">ESC</kbd>
          </div>
        </form>

        {!searchActive && (
          <div className="flex flex-wrap gap-2 px-4 py-3">
            {COMMANDS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.run}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[12px] text-accent hover:bg-accent/20"
              >
                {c.label}
              </button>
            ))}
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s)
                  queueMicrotask(() => {
                    useMemoryStore.getState().runSearch()
                    useMemoryStore.getState().setTab('graph')
                  })
                }}
                className="rounded-full border border-line px-3 py-1 text-[12px] text-muted hover:border-accent/40 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {searchActive && (
          <div>
            <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted">
              <span>{searchHits.length} matches · graph will isolate them</span>
              <button
                type="button"
                onClick={clearSearch}
                className="hover:text-ink"
              >
                Clear
              </button>
            </div>
            <ul className="max-h-80 overflow-auto scrollbar-thin">
              {searchHits.map((hit) => {
                const node = nodes.find((n) => n.id === hit.nodeIds[0])
                const color = node ? CATEGORY_META[node.category].color : '#9a9284'
                return (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (hit.kind === 'node') openNode(hit.id)
                        else setTab('knowledge')
                        setSearchOpen(false)
                      }}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] text-ink">{hit.title}</span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                          {hit.kind === 'node' ? 'Subtheme' : 'Learning'} · {hit.subtitle}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] tracking-wide text-faint uppercase">
                        {hit.kind}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
