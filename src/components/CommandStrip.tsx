import { formatInt } from '../lib/format'
import { useMemoryStore } from '../store'

export function CommandStrip() {
  const liveTimes = useMemoryStore((s) => s.liveTimes)
  const ingestCount = useMemoryStore((s) => s.ingestCount)
  const alerts = useMemoryStore((s) => s.alerts)
  const agents = useMemoryStore((s) => s.agents)
  const brief = useMemoryStore((s) => s.brief)
  const liveEvents = useMemoryStore((s) => s.liveEvents)
  const live = useMemoryStore((s) => s.live)
  const jobs = useMemoryStore((s) => s.jobs)
  const eps = liveTimes.filter((t) => Date.now() - t < 5000).length / 5
  const open = alerts.filter((a) => !a.acked).length
  const runningAgents = agents.filter((a) => a.status === 'running').length
  const runningJobs = jobs.filter((j) => j.status === 'running').length
  const slo = Math.max(92, 99.8 - open * 0.35 - (brief.threat / 80)).toFixed(2)
  const last = liveEvents[0]

  return (
    <div className="grid shrink-0 grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4 xl:grid-cols-8">
      <Kpi k="EPS" v={eps.toFixed(1)} sub={live ? 'streaming' : 'paused'} hot={live} />
      <Kpi k="Ingested" v={formatInt(ingestCount)} sub="records" />
      <Kpi k="Threat" v={`${brief.threat}`} sub={brief.headline.slice(0, 22)} hot={brief.threat >= 40} />
      <Kpi k="Alerts" v={String(open)} sub="unacked" hot={open > 0} />
      <Kpi k="Agents" v={`${runningAgents}/${agents.length}`} sub="active" />
      <Kpi k="Jobs" v={String(runningJobs)} sub="pipelines" />
      <Kpi k="SLO" v={`${slo}%`} sub="retrieval" />
      <Kpi
        k="Last"
        v={last ? last.kind.toUpperCase() : '—'}
        sub={last ? last.shipment ?? last.title.slice(0, 18) : 'awaiting'}
      />
    </div>
  )
}

function Kpi({
  k,
  v,
  sub,
  hot,
}: {
  k: string
  v: string
  sub: string
  hot?: boolean
}) {
  return (
    <div className="bg-panel px-3 py-2">
      <div className="text-[9px] tracking-[0.16em] text-faint uppercase">{k}</div>
      <div className={`font-display text-[22px] leading-none ${hot ? 'text-issues' : 'text-accent'}`}>
        {v}
      </div>
      <div className="mt-0.5 truncate text-[10px] text-muted">{sub}</div>
    </div>
  )
}
