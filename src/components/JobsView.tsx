import { formatClock, formatDuration, formatInt } from '../lib/format'
import { useMemoryStore } from '../store'
import type { JobStatus } from '../types'

const STATUS: Record<JobStatus, { label: string; className: string; dot: string }> = {
  running: {
    label: 'Running',
    className: 'border-ops/30 bg-ops/10 text-ops',
    dot: 'bg-ops animate-pulse',
  },
  completed: {
    label: 'Completed',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  failed: {
    label: 'Failed',
    className: 'border-issues/30 bg-issues/10 text-issues',
    dot: 'bg-issues',
  },
}

export function JobsView() {
  const jobs = useMemoryStore((s) => s.jobs)
  const running = jobs.filter((j) => j.status === 'running').length
  const failed = jobs.filter((j) => j.status === 'failed').length
  const ok = jobs.filter((j) => j.status === 'completed').length

  return (
    <div className="relative h-full min-h-0 overflow-auto bg-paper px-6 py-5 scrollbar-thin">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Pipelines</div>
          <h2 className="font-display text-[30px] leading-none">Jobs</h2>
          <p className="mt-2 text-[13px] text-muted">
            Pipelines are driven by the live ingest stream — record counts tick as
            batches land.
          </p>
        </div>
        <div className="flex gap-2">
          <Kpi label="Running" value={running} tone="text-ops" />
          <Kpi label="Completed" value={ok} tone="text-emerald-300" />
          <Kpi label="Failed" value={failed} tone="text-issues" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="bg-black/20 text-[10.5px] tracking-[0.14em] text-faint uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Job</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Schedule</th>
              <th className="px-4 py-2.5 font-medium">Last run</th>
              <th className="px-4 py-2.5 font-medium">Records</th>
              <th className="px-4 py-2.5 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const st = STATUS[job.status]
              return (
                <tr key={job.id} className="border-t border-line hover:bg-white/5">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-ink">{job.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-faint">{job.id}</div>
                    {job.status === 'running' && (
                      <div className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-line">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-ops" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] ${st.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-muted">{job.cron}</td>
                  <td className="px-4 py-3.5 text-muted">{formatClock(job.lastRun)}</td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-ink">
                    {formatInt(job.records)}
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-muted">
                    {job.status === 'running' ? '—' : formatDuration(job.durationMs)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-[88px] rounded-xl border border-line bg-panel px-3 py-2">
      <div className="text-[10.5px] tracking-wide text-faint uppercase">{label}</div>
      <div className={`font-display text-[26px] leading-none ${tone}`}>{value}</div>
    </div>
  )
}
