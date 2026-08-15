import type { AlertItem, LiveEvent, SituationBrief } from '../types'

export function composeBrief(events: LiveEvent[], alerts: AlertItem[]): SituationBrief {
  const recent = events.slice(0, 24)
  const kinds = new Map<string, number>()
  const pair = new Map<string, number>()
  for (const e of recent) {
    kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1)
    if (e.nodeIds.length >= 2) {
      const k = `${e.nodeIds[0]}|${e.nodeIds[1]}`
      pair.set(k, (pair.get(k) ?? 0) + 1)
    }
  }
  const topPair = [...pair.entries()].sort((a, b) => b[1] - a[1])[0]
  const open = alerts.filter((a) => !a.acked)
  const crit = open.filter((a) => a.severity === 'crit').length
  const threat = Math.min(100, open.length * 12 + crit * 18 + (kinds.get('alert') ?? 0) * 8)
  const bullets = [
    `${recent.length} events in the working window · ${kinds.get('cooccur') ?? 0} co-occur · ${kinds.get('extract') ?? 0} extracts`,
    topPair
      ? `Hottest retrieval pair ${topPair[0].replace('|', ' ↔ ')} ×${topPair[1]}`
      : 'No dominant pair yet',
    open.length
      ? `${open.length} unacked alerts (${crit} critical)`
      : 'No open alerts — field is calm',
    kinds.get('learning')
      ? `${kinds.get('learning')} playbooks distilled this window`
      : 'No new playbooks this window',
  ]
  const headline =
    threat >= 60
      ? 'Elevated exception pressure — comms + charges coupling'
      : threat >= 30
        ? 'Active retrieval — watch dwell and docs'
        : 'Nominal memory field'

  return { at: new Date().toISOString(), headline, bullets, threat }
}
