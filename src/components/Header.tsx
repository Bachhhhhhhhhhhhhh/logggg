import { useEffect, useState } from 'react'
import { formatInt, formatLiveClock } from '../lib/format'
import { downloadText } from '../lib/prefs'
import { useMemoryStore } from '../store'

export function Header() {
  const setImportOpen = useMemoryStore((s) => s.setImportOpen)
  const setSearchOpen = useMemoryStore((s) => s.setSearchOpen)
  const setAtlasOpen = useMemoryStore((s) => s.setAtlasOpen)
  const setSettingsOpen = useMemoryStore((s) => s.setSettingsOpen)
  const setTouring = useMemoryStore((s) => s.setTouring)
  const pushToast = useMemoryStore((s) => s.pushToast)
  const nodes = useMemoryStore((s) => s.nodes)
  const links = useMemoryStore((s) => s.links)
  const jobs = useMemoryStore((s) => s.jobs)
  const generatedAt = useMemoryStore((s) => s.generatedAt)
  const running = jobs.filter((j) => j.status === 'running').length
  const live = useMemoryStore((s) => s.live)
  const setLive = useMemoryStore((s) => s.setLive)
  const liveSpeed = useMemoryStore((s) => s.liveSpeed)
  const ingestCount = useMemoryStore((s) => s.ingestCount)
  const liveTimes = useMemoryStore((s) => s.liveTimes)
  const eps = liveTimes.filter((t) => Date.now() - t < 5000).length / 5
  const [clock, setClock] = useState(() => formatLiveClock())

  useEffect(() => {
    const t = window.setInterval(() => setClock(formatLiveClock()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useMemoryStore.getState().setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="relative z-30 border-b border-line bg-panel/80 backdrop-blur-xl">
      <div className="h-px gold-line" />
      <div className="flex items-center gap-5 px-3 py-2">
        <div className="flex min-w-[190px] items-center gap-3">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-gradient-to-br from-[#2a2114] to-[#0c0e14] text-accent shadow-[0_0_24px_rgba(212,175,120,0.18)]">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden>
              <circle cx="10" cy="12" r="2.3" fill="currentColor" />
              <circle cx="22" cy="10" r="2.3" fill="currentColor" />
              <circle cx="16" cy="21" r="2.3" fill="currentColor" />
              <path
                d="M11.7 12.8L14.6 19.4M20.4 11.4L17.4 19.2M11.8 11.4L20.2 10.4"
                stroke="#f3ddb0"
                strokeWidth="1.5"
              />
            </svg>
          </span>
          <div className="leading-none">
            <h1 className="font-display text-[26px] leading-none tracking-[0.06em] text-ink">
              Memory
            </h1>
            <p className="mt-1 hidden text-[10px] tracking-[0.18em] text-faint uppercase lg:block">
              Agentic retrieval
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mx-auto hidden h-9 max-w-xl flex-1 items-center gap-3 rounded-full border border-line-strong bg-canvas/80 px-3 text-left text-[12.5px] text-faint transition hover:border-accent/40 md:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 16l4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="flex-1">Search memory — describe what you need...</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-3 pr-1 text-[11px] text-muted xl:flex">
            <span className="font-mono tabular-nums text-accent">{clock}</span>
            <span className="text-line-strong">|</span>
            <span className="font-mono tabular-nums text-ink">{formatInt(nodes.length)}</span>
            <span>nodes</span>
            <span className="font-mono tabular-nums text-ink">{formatInt(links.length)}</span>
            <span>edges</span>
            <button
              type="button"
              onClick={() => setLive(!live)}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 px-2 py-0.5"
            >
              <span className={live ? 'live-dot' : 'h-1.5 w-1.5 rounded-full bg-faint'} />
              <span className="font-mono tabular-nums text-accent">{eps.toFixed(1)}</span>
              <span>eps</span>
              <span className="text-line-strong">·</span>
              <span className="font-mono tabular-nums">{formatInt(ingestCount)}</span>
              <span>ingested</span>
              <span className="text-line-strong">·</span>
              {live ? `${liveSpeed}x` : 'paused'}
            </button>
            <span className="inline-flex items-center gap-1.5">
              {running ? `${running} job` : 'idle'}
            </span>
          </div>
          <div className="hidden font-mono text-[10px] tracking-wide text-faint uppercase 2xl:block">
            {generatedAt.slice(0, 10)}
          </div>
          <button
            type="button"
            onClick={() => setAtlasOpen(true)}
            className="hidden rounded-md border border-line px-2 py-1.5 text-[12px] text-muted hover:text-ink lg:inline"
          >
            Atlas
          </button>
          <button
            type="button"
            onClick={() => {
              setTouring(true)
              useMemoryStore.getState().setTab('graph')
            }}
            className="hidden rounded-md border border-line px-2 py-1.5 text-[12px] text-muted hover:text-ink lg:inline"
          >
            Tour
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="hidden rounded-md border border-line px-2 py-1.5 text-[12px] text-muted hover:text-ink lg:inline"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => {
              const s = useMemoryStore.getState()
              downloadText(
                'memory-snapshot.json',
                JSON.stringify(
                  {
                    generatedAt: s.generatedAt,
                    nodes: s.nodes,
                    links: s.links,
                    knowledge: s.knowledge,
                    communities: s.communities,
                    bookmarks: s.bookmarks,
                    notes: s.notes,
                  },
                  null,
                  2,
                ),
              )
              pushToast('Snapshot exported')
            }}
            className="hidden rounded-md border border-line px-2 py-1.5 text-[12px] text-muted hover:text-ink xl:inline"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-[12px] font-medium text-accent transition hover:bg-accent/20"
          >
            Import
          </button>
        </div>
      </div>
    </header>
  )
}
