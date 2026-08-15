import { formatClock } from '../lib/format'
import { useMemoryStore } from '../store'
import type { DevKind } from '../types'

const KIND: Record<DevKind, { label: string; bar: string }> = {
  add: { label: 'Add', bar: 'bg-ops' },
  merge: { label: 'Merge', bar: 'bg-finance' },
  detect: { label: 'Detect', bar: 'bg-docs' },
  reindex: { label: 'Reindex', bar: 'bg-accent' },
  fix: { label: 'Fix', bar: 'bg-issues' },
}

export function DevWorkView() {
  const events = useMemoryStore((s) => s.devwork)

  return (
    <div className="relative h-full min-h-0 overflow-auto bg-paper px-6 py-5 scrollbar-thin">
      <div className="mb-6">
        <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Changelog</div>
        <h2 className="font-display text-[30px] leading-none">Dev work</h2>
        <p className="mt-2 text-[13px] text-muted">
          Mutations to the memory graph — adds, merges, community refreshes, reindexes.
        </p>
      </div>
      <ol className="relative mx-auto max-w-3xl">
        {events.map((event, i) => {
          const kind = KIND[event.kind]
          return (
            <li
              key={event.id}
              className="rise relative pb-5 pl-8"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              {i < events.length - 1 && (
                <span className="absolute top-3 left-[7px] h-full w-px bg-line" />
              )}
              <span className={`absolute top-2 left-0 h-3.5 w-3.5 rounded-full ${kind.bar}`} />
              <article className="overflow-hidden rounded-2xl border border-line bg-panel">
                <div className={`h-px ${kind.bar}`} />
                <div className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] tracking-wide text-accent uppercase">
                      {kind.label}
                    </span>
                    <time className="font-mono text-[11px] text-muted">
                      {formatClock(event.at)}
                    </time>
                  </div>
                  <h3 className="mt-2 text-[15px] font-medium text-ink">{event.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{event.detail}</p>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
