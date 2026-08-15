import { useMemoryStore } from '../store'

export function Ticker() {
  const liveEvents = useMemoryStore((s) => s.liveEvents)
  const live = useMemoryStore((s) => s.live)
  const items =
    liveEvents.length > 0
      ? liveEvents.slice(0, 12).map((e) => `${e.kind.toUpperCase()} · ${e.title}`)
      : ['STREAM WARMING UP']
  const loop = [...items, ...items]

  return (
    <div className="relative flex h-8 shrink-0 items-center overflow-hidden border-t border-line bg-panel/90">
      <div className="z-10 flex items-center gap-1.5 border-r border-line bg-panel px-3 font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
        <span className={live ? 'live-dot' : 'h-1.5 w-1.5 rounded-full bg-faint'} />
        Live
      </div>
      <div className="ticker-track flex min-w-max items-center gap-8 px-6">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8 text-[11.5px] text-muted">
            <span className="max-w-[520px] truncate">{item}</span>
            <span className="text-accent/50">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
