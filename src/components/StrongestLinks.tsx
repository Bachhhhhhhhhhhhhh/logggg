import { categoryColor } from '../lib/categories'
import { formatInt } from '../lib/format'
import { nodeById, strongestLinks, useMemoryStore } from '../store'

export function StrongestLinks() {
  const links = useMemoryStore((s) => s.links)
  const nodes = useMemoryStore((s) => s.nodes)
  const selectedIds = useMemoryStore((s) => s.selectedIds)
  const selectPair = useMemoryStore((s) => s.selectPair)
  const ranked = strongestLinks(links, 12)
  const max = ranked[0]?.weight ?? 1

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l border-line bg-panel/95">
      <div className="border-b border-line px-4 py-4">
        <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Gravity</div>
        <h2 className="font-display mt-1 text-[22px] leading-none text-ink">Strongest links</h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Highest co-occurrence. Click a pair to isolate the edge in the field.
        </p>
      </div>
      <ol className="flex-1 overflow-auto px-2 py-2 scrollbar-thin">
        {ranked.map((link, i) => {
          const source = nodeById(nodes, link.source)
          const target = nodeById(nodes, link.target)
          if (!source || !target) return null
          const active =
            selectedIds.includes(link.source) && selectedIds.includes(link.target)
          return (
            <li key={`${link.source}-${link.target}`}>
              <button
                type="button"
                onClick={() => selectPair(link.source, link.target)}
                className={`w-full rounded-xl px-2.5 py-2.5 text-left transition ${
                  active ? 'bg-accent/15' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] leading-snug">
                      <span style={{ color: categoryColor(source.category) }}>{source.label}</span>
                      <span className="text-faint"> ↔ </span>
                      <span style={{ color: categoryColor(target.category) }}>{target.label}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-accent">
                    {formatInt(link.weight)}
                  </span>
                </div>
                <div className="mt-2 h-px overflow-hidden bg-line">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-transparent"
                    style={{ width: `${Math.max(12, (link.weight / max) * 100)}%` }}
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
