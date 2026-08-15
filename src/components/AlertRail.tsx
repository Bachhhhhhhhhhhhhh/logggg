import { useMemoryStore } from '../store'

export function AlertRail() {
  const alerts = useMemoryStore((s) => s.alerts)
  const ackAlert = useMemoryStore((s) => s.ackAlert)
  const ackAllAlerts = useMemoryStore((s) => s.ackAllAlerts)
  const selectPair = useMemoryStore((s) => s.selectPair)
  const openNode = useMemoryStore((s) => s.openNode)
  const open = alerts.filter((a) => !a.acked)

  return (
    <aside className="flex w-[210px] shrink-0 flex-col border-r border-line bg-panel/90">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <div>
          <div className="text-[9px] tracking-[0.2em] text-accent uppercase">Inbox</div>
          <div className="font-display text-[20px] leading-none">{open.length}</div>
        </div>
        <button type="button" onClick={ackAllAlerts} className="text-[10px] text-muted hover:text-ink">
          Ack all
        </button>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        {open.length === 0 && (
          <p className="px-3 py-6 text-[11.5px] text-muted">No unacked alerts. Field nominal.</p>
        )}
        {open.map((a) => (
          <div key={a.id} className="border-b border-line px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-mono text-[9px] uppercase ${
                  a.severity === 'crit' ? 'text-issues' : 'text-finance'
                }`}
              >
                {a.severity}
              </span>
              <span className="font-mono text-[9px] text-faint">{a.at.slice(11, 19)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (a.nodeIds.length >= 2) selectPair(a.nodeIds[0], a.nodeIds[1])
                else if (a.nodeIds[0]) openNode(a.nodeIds[0])
              }}
              className="mt-1 text-left text-[12px] leading-snug text-ink hover:text-accent"
            >
              {a.title}
            </button>
            <button
              type="button"
              onClick={() => ackAlert(a.id)}
              className="mt-1 text-[10px] text-muted hover:text-ink"
            >
              Ack
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
