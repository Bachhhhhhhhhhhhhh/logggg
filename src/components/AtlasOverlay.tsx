import { useMemo, useState } from 'react'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/categories'
import { formatInt } from '../lib/format'
import { useMemoryStore } from '../store'
import type { Category } from '../types'

export function AtlasOverlay() {
  const open = useMemoryStore((s) => s.atlasOpen)
  const setAtlasOpen = useMemoryStore((s) => s.setAtlasOpen)
  const nodes = useMemoryStore((s) => s.nodes)
  const communities = useMemoryStore((s) => s.communities)
  const bookmarks = useMemoryStore((s) => s.bookmarks)
  const toggleBookmark = useMemoryStore((s) => s.toggleBookmark)
  const openNode = useMemoryStore((s) => s.openNode)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [sort, setSort] = useState<'size' | 'label' | 'degree'>('size')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return nodes
      .filter((n) => (cat === 'all' ? true : n.category === cat))
      .filter((n) =>
        needle
          ? `${n.label} ${n.id} ${n.description}`.toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => {
        if (sort === 'label') return a.label.localeCompare(b.label)
        if (sort === 'degree') return b.degree - a.degree
        return b.size - a.size
      })
  }, [cat, nodes, q, sort])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-0 md:items-center md:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close atlas"
        onClick={() => setAtlasOpen(false)}
      />
      <div className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-accent/20 bg-panel md:h-[78vh] md:rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-accent uppercase">Index</div>
            <div className="font-display text-[24px] leading-none">Atlas</div>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter subthemes…"
            className="ml-3 h-9 w-56 rounded-lg border border-line bg-canvas px-3 text-[12.5px] outline-none focus:border-accent"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as Category | 'all')}
            className="h-9 rounded-lg border border-line bg-canvas px-2 text-[12px]"
          >
            <option value="all">All categories</option>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].short}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'size' | 'label' | 'degree')}
            className="h-9 rounded-lg border border-line bg-canvas px-2 text-[12px]"
          >
            <option value="size">Centrality</option>
            <option value="degree">Degree</option>
            <option value="label">Name</option>
          </select>
          <span className="ml-auto font-mono text-[12px] text-muted">{rows.length}</span>
          <button type="button" onClick={() => setAtlasOpen(false)} className="text-muted">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-left text-[12.5px]">
            <thead className="sticky top-0 bg-panel text-[10px] tracking-wide text-faint uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Subtheme</th>
                <th className="px-4 py-2 font-medium">Area</th>
                <th className="px-4 py-2 font-medium">Cluster</th>
                <th className="px-4 py-2 font-medium">Deg</th>
                <th className="px-4 py-2 font-medium">Pin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => {
                const c = communities.find((x) => x.id === n.communityId)
                return (
                  <tr key={n.id} className="border-t border-line hover:bg-white/5">
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          openNode(n.id)
                          setAtlasOpen(false)
                        }}
                        className="text-left text-ink hover:text-accent"
                      >
                        {n.label}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-muted">{CATEGORY_META[n.category].short}</td>
                    <td className="px-4 py-2 text-muted">{c?.name ?? '—'}</td>
                    <td className="px-4 py-2 font-mono">{formatInt(n.degree)}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(n.id)}
                        className={bookmarks.includes(n.id) ? 'text-accent' : 'text-faint'}
                      >
                        {bookmarks.includes(n.id) ? '★' : '☆'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
