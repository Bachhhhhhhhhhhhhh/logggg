import { CATEGORY_META, CATEGORY_ORDER } from '../lib/categories'
import { formatRelative } from '../lib/format'
import { nodeById, useMemoryStore } from '../store'

export function KnowledgeView() {
  const knowledge = useMemoryStore((s) => s.knowledge)
  const nodes = useMemoryStore((s) => s.nodes)
  const filter = useMemoryStore((s) => s.knowledgeFilter)
  const query = useMemoryStore((s) => s.knowledgeQuery)
  const setFilter = useMemoryStore((s) => s.setKnowledgeFilter)
  const setQuery = useMemoryStore((s) => s.setKnowledgeQuery)
  const openNode = useMemoryStore((s) => s.openNode)

  const q = query.trim().toLowerCase()
  const items = knowledge.filter((item) => {
    if (filter !== 'all' && item.category !== filter) return false
    if (!q) return true
    const labels = item.nodeIds
      .map((id) => nodeById(nodes, id)?.label ?? '')
      .join(' ')
    return `${item.text} ${item.source} ${labels}`.toLowerCase().includes(q)
  })
  const featured = items[0]
  const rest = items.slice(1)

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-paper">
      <div className="noise absolute inset-0 opacity-[0.03]" />
      <div className="relative flex flex-wrap items-center gap-2 border-b border-line px-3 py-3 md:px-6">
        <div>
          <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Distilled</div>
          <div className="font-display text-[26px] leading-none">Knowledge</div>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter learnings…"
          className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-ink outline-none placeholder:text-faint focus:border-accent md:ml-4 md:h-9 md:w-64 md:text-[12.5px]"
        />
        <div className="flex flex-wrap gap-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          {CATEGORY_ORDER.map((cat) => (
            <FilterChip
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              label={CATEGORY_META[cat].short}
              color={CATEGORY_META[cat].color}
            />
          ))}
        </div>
        <span className="ml-auto font-mono text-[12px] text-muted">{items.length}</span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto px-3 py-4 scrollbar-thin md:px-6 md:py-5">
        {featured && (
          <article className="rise relative mb-4 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-[#1a160f] to-[#0c0e14] p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(700px 240px at 100% 0%, ${CATEGORY_META[featured.category].color}55, transparent 55%)`,
              }}
            />
            <div className="relative">
              <div className="text-[10.5px] tracking-[0.18em] text-accent uppercase">
                Latest · {CATEGORY_META[featured.category].short}
              </div>
              <p className="font-display mt-3 max-w-3xl text-[20px] leading-snug text-ink md:text-[26px]">
                {featured.text}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {featured.nodeIds.map((id) => {
                  const n = nodeById(nodes, id)
                  if (!n) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openNode(id)}
                      className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11.5px] text-accent hover:bg-accent/20"
                    >
                      {n.label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 text-[11.5px] text-muted">
                {featured.source} · {formatRelative(featured.updatedAt)}
              </div>
            </div>
          </article>
        )}

        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {rest.map((item, i) => (
            <li
              key={item.id}
              className="rise rounded-2xl border border-line bg-panel p-4 transition hover:border-accent/25"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div
                className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                style={{
                  background: `${CATEGORY_META[item.category].color}22`,
                  color: CATEGORY_META[item.category].color,
                }}
              >
                {CATEGORY_META[item.category].short}
              </div>
              <p className="text-[13.5px] leading-relaxed text-ink">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.nodeIds.map((id) => {
                  const n = nodeById(nodes, id)
                  if (!n) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openNode(id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[11px] text-ink hover:border-accent/40"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: CATEGORY_META[n.category].color }}
                      />
                      {n.label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 text-[11.5px] text-muted">
                {item.source} · {formatRelative(item.updatedAt)}
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="py-16 text-center text-[13px] text-muted">
            No learnings match this filter.
          </p>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] ${
        active ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-ink'
      }`}
    >
      {color && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      )}
      {label}
    </button>
  )
}
