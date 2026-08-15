import { useMemoryStore } from '../store'

export function AgentDock() {
  const agents = useMemoryStore((s) => s.agents)
  const brief = useMemoryStore((s) => s.brief)
  const openNode = useMemoryStore((s) => s.openNode)

  return (
    <div className="grid shrink-0 grid-cols-1 border-t border-line bg-panel xl:grid-cols-[1fr_280px]">
      <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-thin">
        {agents.map((ag) => (
          <button
            key={ag.id}
            type="button"
            onClick={() => openNode(ag.nodeId)}
            className="min-w-[148px] rounded-xl border border-line px-2.5 py-2 text-left hover:border-accent/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium">{ag.name}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  ag.status === 'running'
                    ? 'bg-ops animate-pulse'
                    : ag.status === 'blocked'
                      ? 'bg-issues'
                      : 'bg-faint'
                }`}
              />
            </div>
            <div className="text-[10px] text-faint">{ag.role}</div>
            <div className="mt-1 truncate text-[11px] text-muted">{ag.task}</div>
            <div className="mt-1 font-mono text-[10px] text-accent">
              {ag.tokens.toLocaleString()} tok
            </div>
          </button>
        ))}
      </div>
      <div className="border-t border-line px-3 py-2 xl:border-t-0 xl:border-l">
        <div className="text-[9px] tracking-[0.18em] text-accent uppercase">Brief</div>
        <div className="font-display text-[16px] leading-tight">{brief.headline}</div>
        <ul className="mt-1 space-y-0.5 text-[10.5px] text-muted">
          {brief.bullets.slice(0, 3).map((b) => (
            <li key={b} className="truncate">
              · {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
