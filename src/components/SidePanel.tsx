import { CATEGORY_META } from '../lib/categories'
import { formatInt } from '../lib/format'
import { bridgeScores } from '../lib/ego'
import { pathWeight, strongestPath } from '../lib/path'
import { nodeById, strongestLinks, useMemoryStore } from '../store'
import type { SidePanel as SidePanelId } from '../types'

const TABS: { id: SidePanelId; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: 'links', label: 'Links' },
  { id: 'hubs', label: 'Hubs' },
  { id: 'bridges', label: 'Bridges' },
  { id: 'pins', label: 'Pins' },
  { id: 'path', label: 'Path' },
]

export function SidePanel() {
  const tab = useMemoryStore((s) => s.sidePanel)
  const setTab = useMemoryStore((s) => s.setSidePanel)
  const links = useMemoryStore((s) => s.links)
  const nodes = useMemoryStore((s) => s.nodes)
  const selectedIds = useMemoryStore((s) => s.selectedIds)
  const selectPair = useMemoryStore((s) => s.selectPair)
  const openNode = useMemoryStore((s) => s.openNode)
  const bookmarks = useMemoryStore((s) => s.bookmarks)
  const toggleBookmark = useMemoryStore((s) => s.toggleBookmark)
  const liveEvents = useMemoryStore((s) => s.liveEvents)
  const live = useMemoryStore((s) => s.live)
  const setLive = useMemoryStore((s) => s.setLive)
  const liveSpeed = useMemoryStore((s) => s.liveSpeed)
  const setLiveSpeed = useMemoryStore((s) => s.setLiveSpeed)
  const followLive = useMemoryStore((s) => s.followLive)
  const setFollowLive = useMemoryStore((s) => s.setFollowLive)
  const ranked = strongestLinks(links, 12)
  const max = ranked[0]?.weight ?? 1
  const hubs = [...nodes].sort((a, b) => b.size - a.size).slice(0, 12)
  const bridges = bridgeScores(nodes, links).slice(0, 12)
  const path =
    selectedIds.length >= 2 ? strongestPath(links, selectedIds[0], selectedIds[1]) : null

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l border-line bg-panel/95">
      <div className="flex gap-0.5 overflow-x-auto border-b border-line px-2 py-2 scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-2 py-1 text-[11px] ${
              tab === t.id ? 'bg-accent/15 text-accent' : 'text-faint hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-2 py-2 scrollbar-thin">
        {tab === 'live' && (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1 px-1">
              <button
                type="button"
                onClick={() => setLive(!live)}
                className={`rounded-md px-2 py-0.5 text-[11px] ${
                  live ? 'bg-accent/20 text-accent' : 'text-faint'
                }`}
              >
                {live ? 'Streaming' : 'Paused'}
              </button>
              {([1, 2, 4] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setLiveSpeed(s)}
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    liveSpeed === s ? 'text-accent' : 'text-faint'
                  }`}
                >
                  {s}x
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFollowLive(!followLive)}
                className={`ml-auto rounded-md px-2 py-0.5 text-[11px] ${
                  followLive ? 'text-accent' : 'text-faint'
                }`}
              >
                Follow
              </button>
            </div>
            {liveEvents.length === 0 && (
              <p className="px-2 py-4 text-[12px] text-muted">Waiting for stream…</p>
            )}
            {liveEvents.slice(0, 40).map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  if (ev.nodeIds.length >= 2) selectPair(ev.nodeIds[0], ev.nodeIds[1])
                  else if (ev.nodeIds[0]) openNode(ev.nodeIds[0])
                }}
                className="mb-1 w-full rounded-xl px-2.5 py-2 text-left hover:bg-white/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] tracking-wide text-accent uppercase">
                    {ev.kind}
                  </span>
                  <span className="font-mono text-[9px] text-faint">
                    {ev.at.slice(11, 19)}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-ink">{ev.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted">{ev.detail}</div>
              </button>
            ))}
          </div>
        )}
        {tab === 'links' &&
          ranked.map((link, i) => {
            const source = nodeById(nodes, link.source)
            const target = nodeById(nodes, link.target)
            if (!source || !target) return null
            const active =
              selectedIds.includes(link.source) && selectedIds.includes(link.target)
            return (
              <button
                key={`${link.source}-${link.target}`}
                type="button"
                onClick={() => selectPair(link.source, link.target)}
                className={`mb-1 w-full rounded-xl px-2.5 py-2 text-left ${
                  active ? 'bg-accent/15' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between gap-2">
                  <span className="truncate text-[12px]">
                    <span className="font-mono text-[10px] text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>{' '}
                    {source.label} ↔ {target.label}
                  </span>
                  <span className="font-mono text-[11px] text-accent">
                    {formatInt(link.weight)}
                  </span>
                </div>
                <div className="mt-1.5 h-px bg-line">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.max(10, (link.weight / max) * 100)}%` }}
                  />
                </div>
              </button>
            )
          })}

        {tab === 'hubs' &&
          hubs.map((n, i) => (
            <button
              key={n.id}
              type="button"
              onClick={() => openNode(n.id)}
              className="mb-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 hover:bg-white/5"
            >
              <span className="flex items-center gap-2 truncate text-[12.5px]">
                <span className="font-mono text-[10px] text-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: CATEGORY_META[n.category].color }}
                />
                {n.label}
              </span>
              <span className="font-mono text-[11px] text-muted">{n.degree}</span>
            </button>
          ))}

        {tab === 'bridges' &&
          bridges.map((row) => {
            const n = nodeById(nodes, row.id)
            if (!n) return null
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => openNode(n.id)}
                className="mb-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 hover:bg-white/5"
              >
                <span className="truncate text-[12.5px]">{n.label}</span>
                <span className="font-mono text-[11px] text-accent">{formatInt(row.value)}</span>
              </button>
            )
          })}

        {tab === 'pins' &&
          (bookmarks.length === 0 ? (
            <p className="px-2 py-6 text-[12.5px] text-muted">
              Pin nodes from the inspector or atlas. They persist here.
            </p>
          ) : (
            bookmarks.map((id) => {
              const n = nodeById(nodes, id)
              if (!n) return null
              return (
                <div
                  key={id}
                  className="mb-1 flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-white/5"
                >
                  <button type="button" onClick={() => openNode(id)} className="truncate text-[12.5px]">
                    {n.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(id)}
                    className="text-[11px] text-accent"
                  >
                    ×
                  </button>
                </div>
              )
            })
          ))}

        {tab === 'path' &&
          (path && path.length > 1 ? (
            <div className="px-1">
              <div className="mb-2 text-[11px] text-muted">
                {path.length - 1} hops · weight {formatInt(pathWeight(links, path))}
              </div>
              <ol>
                {path.map((id, i) => {
                  const n = nodeById(nodes, id)
                  if (!n) return null
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => openNode(id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
                      >
                        <span className="font-mono text-[10px] text-faint">{i + 1}</span>
                        <span className="text-[12.5px]">{n.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          ) : (
            <p className="px-2 py-6 text-[12.5px] text-muted">
              Shift-click two nodes to compute the strongest retrieval path.
            </p>
          ))}
      </div>
    </aside>
  )
}
