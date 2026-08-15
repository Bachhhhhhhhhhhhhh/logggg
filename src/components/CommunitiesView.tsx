import { CATEGORY_META } from '../lib/categories'
import { formatInt } from '../lib/format'
import { nodeById, useMemoryStore } from '../store'
import type { MemoryNode } from '../types'

export function CommunitiesView() {
  const communities = useMemoryStore((s) => s.communities)
  const nodes = useMemoryStore((s) => s.nodes)
  const links = useMemoryStore((s) => s.links)
  const focusCommunity = useMemoryStore((s) => s.focusCommunity)

  return (
    <div className="relative h-full min-h-0 overflow-auto bg-paper px-3 py-4 scrollbar-thin md:px-6 md:py-5">
      <div className="noise absolute inset-0 opacity-[0.03]" />
      <div className="relative mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Leiden</div>
          <h2 className="font-display text-[30px] leading-none">Communities</h2>
          <p className="mt-2 max-w-2xl text-[13px] text-muted">
            Operational neighborhoods the agents keep landing in — each one a reusable skill
            cluster.
          </p>
        </div>
        <div className="font-mono text-[12px] text-muted">{communities.length} clusters</div>
      </div>
      <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-2">
        {communities.map((c, i) => {
          const members = c.nodeIds
            .map((id) => nodeById(nodes, id))
            .filter((n) => n !== undefined)
          const featured = [...members].sort((a, b) => b.size - a.size).slice(0, 8)
          const density =
            members.length > 1
              ? c.internalLinks / ((members.length * (members.length - 1)) / 2)
              : 0
          return (
            <article
              key={c.id}
              className="rise flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 hover:border-accent/25 sm:flex-row"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Constellation members={members} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[22px] leading-tight text-ink">{c.name}</h3>
                  <span className="shrink-0 font-mono text-[11px] text-accent">
                    {(density * 100).toFixed(0)}% dense
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{c.description}</p>
                <div className="mt-3 flex gap-4 text-[12px] text-muted">
                  <span>
                    <span className="font-mono text-ink">{formatInt(c.nodeIds.length)}</span> nodes
                  </span>
                  <span>
                    <span className="font-mono text-ink">{formatInt(c.internalLinks)}</span> internal
                  </span>
                  <span>
                    <span className="font-mono text-ink">
                      {formatInt(
                        links.filter(
                          (l) =>
                            c.nodeIds.includes(l.source) !== c.nodeIds.includes(l.target),
                        ).length,
                      )}
                    </span>{' '}
                    bridges
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {featured.map((n) => (
                    <span
                      key={n.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[11.5px]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: CATEGORY_META[n.category].color }}
                      />
                      {n.label}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => focusCommunity(c.id)}
                  className="mt-4 rounded-lg bg-accent/15 px-3 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent/25"
                >
                  View in graph
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function Constellation({ members }: { members: MemoryNode[] }) {
  const size = 118
  const cx = size / 2
  const cy = size / 2
  const ranked = [...members].sort((a, b) => b.size - a.size).slice(0, 12)
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 rounded-xl border border-white/5 bg-canvas"
    >
      {ranked.map((n, i) => {
        const next = ranked[(i + 3) % ranked.length]
        const a = place(i, ranked.length, 38)
        const b = place((i + 3) % ranked.length, ranked.length, 38)
        return (
          <line
            key={`${n.id}-${next.id}`}
            x1={cx + a.x}
            y1={cy + a.y}
            x2={cx + b.x}
            y2={cy + b.y}
            stroke="rgba(212,175,120,0.22)"
            strokeWidth="0.8"
          />
        )
      })}
      {ranked.map((n, i) => {
        const p = place(i, ranked.length, 38)
        const r = 3 + (n.size / 50) * 5
        return (
          <circle
            key={n.id}
            cx={cx + p.x}
            cy={cy + p.y}
            r={r}
            fill={CATEGORY_META[n.category].color}
          />
        )
      })}
    </svg>
  )
}

function place(i: number, n: number, radius: number) {
  const t = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2
  const wobble = 6 * Math.sin(i * 1.7)
  return { x: Math.cos(t) * (radius + wobble), y: Math.sin(t) * (radius + wobble) }
}
