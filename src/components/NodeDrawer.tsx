import { useMemo, useState } from 'react'
import { CATEGORY_META } from '../lib/categories'
import { recommendNeighbors } from '../lib/ego'
import { formatInt } from '../lib/format'
import { copyText } from '../lib/prefs'
import { nodeById, useMemoryStore } from '../store'

type Pane = 'overview' | 'learnings' | 'neighbors' | 'notes'

export function NodeDrawer() {
  const drawerNodeId = useMemoryStore((s) => s.drawerNodeId)
  const closeDrawer = useMemoryStore((s) => s.closeDrawer)
  const openNode = useMemoryStore((s) => s.openNode)
  const setTab = useMemoryStore((s) => s.setTab)
  const nodes = useMemoryStore((s) => s.nodes)
  const links = useMemoryStore((s) => s.links)
  const knowledge = useMemoryStore((s) => s.knowledge)
  const communities = useMemoryStore((s) => s.communities)
  const bookmarks = useMemoryStore((s) => s.bookmarks)
  const toggleBookmark = useMemoryStore((s) => s.toggleBookmark)
  const notes = useMemoryStore((s) => s.notes)
  const setNote = useMemoryStore((s) => s.setNote)
  const selectPair = useMemoryStore((s) => s.selectPair)
  const pushToast = useMemoryStore((s) => s.pushToast)
  const [pane, setPane] = useState<Pane>('overview')

  const node = drawerNodeId ? nodeById(nodes, drawerNodeId) : undefined

  const neighbors = useMemo(() => {
    if (!node) return []
    const rows: { id: string; weight: number }[] = []
    for (const link of links) {
      if (link.source === node.id) rows.push({ id: link.target, weight: link.weight })
      else if (link.target === node.id) rows.push({ id: link.source, weight: link.weight })
    }
    rows.sort((a, b) => b.weight - a.weight)
    return rows
  }, [links, node])

  const related = useMemo(() => {
    if (!node) return []
    return knowledge.filter((k) => k.nodeIds.includes(node.id))
  }, [knowledge, node])

  if (!node) return null
  const meta = CATEGORY_META[node.category]
  const community = communities.find((c) => c.id === node.communityId)
  const avgWeight =
    neighbors.length === 0
      ? 0
      : neighbors.reduce((s, n) => s + n.weight, 0) / neighbors.length

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-end md:items-stretch">
      <button
        type="button"
        aria-label="Close details"
        className="pointer-events-auto h-full flex-1 bg-black/40"
        onClick={closeDrawer}
      />
      <aside className="pointer-events-auto flex max-h-[82dvh] w-full flex-col rounded-t-2xl border-t border-accent/15 bg-[#0a0c12] shadow-[-24px_0_80px_rgba(0,0,0,0.45)] md:max-h-none md:w-[400px] md:rounded-none md:border-t-0 md:border-l">
        <div className="relative overflow-hidden border-b border-line px-5 py-5">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(500px 180px at 0% 0%, ${meta.color}44, transparent 60%)`,
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.22em] text-accent uppercase">
                {meta.label}
              </div>
              <h2 className="font-display mt-1 truncate text-[28px] leading-none text-ink">
                {node.label}
              </h2>
              {community && (
                <div className="mt-2 text-[11.5px] text-muted">{community.name}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleBookmark(node.id)}
                className={`rounded-md px-2 py-1 text-[13px] ${
                  bookmarks.includes(node.id) ? 'text-accent' : 'text-muted'
                }`}
                title="Pin"
              >
                {bookmarks.includes(node.id) ? '★' : '☆'}
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-muted hover:text-ink"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          <div className="relative mt-4 flex gap-1 rounded-lg bg-black/30 p-0.5">
            {(
              [
                ['overview', 'Overview'],
                ['learnings', `Learnings (${related.length})`],
                ['neighbors', `Neighbors (${neighbors.length})`],
                ['notes', 'Notes'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPane(id)}
                className={`flex-1 rounded-md px-2 py-1 text-[11px] ${
                  pane === id ? 'bg-accent/15 text-accent' : 'text-faint'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4 scrollbar-thin">
          {pane === 'overview' && (
            <>
              <p className="text-[13.5px] leading-relaxed text-ink/90">{node.description}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="Degree" value={formatInt(node.degree)} />
                <Stat label="Avg wt" value={avgWeight.toFixed(1)} />
                <Stat label="Centrality" value={node.size.toFixed(1)} />
              </dl>
              <h3 className="mt-6 text-[10px] tracking-[0.18em] text-faint uppercase">
                Appearance · 16 weeks
              </h3>
              <Sparkline values={node.trend} color={meta.color} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${location.origin}${location.pathname}#n=${node.id}`
                    void copyText(url).then(() => pushToast('Deep link copied'))
                  }}
                  className="rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:text-ink"
                >
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void copyText(node.id).then(() => pushToast('Node id copied'))
                  }}
                  className="rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:text-ink"
                >
                  Copy id
                </button>
              </div>
              <h3 className="mt-5 text-[10px] tracking-[0.18em] text-faint uppercase">
                Suggest next
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recommendNeighbors(links, node.id, new Set([node.id]), 5).map((row) => {
                  const n = nodeById(nodes, row.id)
                  if (!n) return null
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => selectPair(node.id, n.id)}
                      className="rounded-full border border-line px-2 py-0.5 text-[11px] hover:border-accent/40"
                    >
                      Path → {n.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {pane === 'learnings' && (
            <>
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab('knowledge')}
                  className="text-[11.5px] text-accent hover:underline"
                >
                  Open Knowledge →
                </button>
              </div>
              {related.length === 0 ? (
                <p className="text-[13px] text-muted">No distilled learnings yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {related.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-line bg-white/5 px-3.5 py-3 text-[13px] leading-relaxed"
                    >
                      {item.text}
                      <div className="mt-2 text-[11px] text-muted">{item.source}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {pane === 'notes' && (
            <div>
              <p className="mb-2 text-[12px] text-muted">
                Private operator note — stored in this browser only.
              </p>
              <textarea
                value={notes[node.id] ?? ''}
                onChange={(e) => setNote(node.id, e.target.value)}
                rows={8}
                placeholder="What should the next agent remember?"
                className="w-full resize-none rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              />
            </div>
          )}

          {pane === 'neighbors' && (
            <ul className="overflow-hidden rounded-xl border border-line">
              {neighbors.map((row) => {
                const n = nodeById(nodes, row.id)
                if (!n) return null
                return (
                  <li key={row.id} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      onClick={() => openNode(n.id)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/5"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: CATEGORY_META[n.category].color }}
                        />
                        <span className="truncate text-[13px]">{n.label}</span>
                      </span>
                      <span className="font-mono text-[11px] text-accent">
                        {formatInt(row.weight)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/5 px-2.5 py-2">
      <div className="text-[10px] tracking-wide text-faint uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-[15px] text-accent">{value}</div>
    </div>
  )
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const w = 340
  const h = 64
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w
    const y = h - 8 - (v / max) * (h - 16)
    return `${x},${y}`
  })
  const area = `0,${h} ${pts.join(' ')} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" height={64}>
      <polyline points={area} fill={`${color}22`} stroke="none" />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
