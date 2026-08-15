import type { LiveEvent, MemoryNode } from '../types'
import { useMemoryStore } from '../store'

const PAIRS: [string, string, string][] = [
  ['exceptions', 'external_messages', 'Exception opened — customer notice dispatched'],
  ['charges', 'invoices', 'Charge line landed on invoice draft'],
  ['exceptions', 'milestones', 'Milestone broke — exception ticket opened'],
  ['milestones', 'route', 'Route hop confirmed against milestone spine'],
  ['shipment_documents', 'document_extraction', 'Packet extracted from intake queue'],
  ['charges', 'exceptions', 'Accessorial attached to open exception'],
  ['quotes', 'invoices', 'Quote converted after booking confirm'],
  ['containers', 'route', 'Box assigned to sailing / lane'],
  ['vessel_delay', 'eta_updates', 'AIS slip pushed new ETA'],
  ['customs_clearance', 'entries', 'Entry accepted — clearance unblocked'],
  ['demurrage', 'port_congestion', 'Dwell clock started at congested terminal'],
  ['document_extraction', 'extraction_confidence_low', 'OCR confidence below threshold'],
]

const EXTRACTS = [
  'Queue extract pulled container + B/L fields from carrier email',
  'Agent resolved Company Entity from booking party, not last thread',
  'ISF amendment detected — AMS sequence rechecked',
  'Terminal appointment slot booked after ETA slip > 12h',
]

const LEARNINGS = [
  (a: string, b: string) =>
    `Live: khi ${a} đồng xuất hiện với ${b}, ưu tiên cập nhật External Message trước khi đụng booking.`,
  (a: string, b: string) =>
    `Live: cặp ${a} ↔ ${b} vừa vượt ngưỡng đồng xuất hiện — đưa vào playbook ca này.`,
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function nodeLabel(nodes: MemoryNode[], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id
}

function shipment() {
  return `SH-${240000 + Math.floor(Math.random() * 9000)}`
}

export function synthesizeEvent(): LiveEvent {
  const { nodes, jobs, agents } = useMemoryStore.getState()
  const roll = Math.random()
  const now = new Date().toISOString()
  const id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
  const agentId = agents.length ? pick(agents).id : undefined

  if (roll < 0.58) {
    const [a, b, title] = pick(PAIRS)
    return {
      id,
      at: now,
      kind: 'cooccur',
      title,
      detail: `${nodeLabel(nodes, a)} ↔ ${nodeLabel(nodes, b)} +1 co-occurrence`,
      nodeIds: [a, b],
      delta: 1 + (Math.random() < 0.15 ? 2 : 0),
      agentId,
      shipment: shipment(),
      severity: 'info',
    }
  }
  if (roll < 0.74) {
    const [a, b] = pick(PAIRS)
    return {
      id,
      at: now,
      kind: 'extract',
      title: pick(EXTRACTS),
      detail: `fields from ${nodeLabel(nodes, a)} / ${nodeLabel(nodes, b)}`,
      nodeIds: [a, b],
      delta: 8 + Math.floor(Math.random() * 40),
      agentId,
      shipment: shipment(),
      severity: 'info',
    }
  }
  if (roll < 0.86) {
    const running = jobs.find((j) => j.status === 'running') ?? jobs[0]
    return {
      id,
      at: now,
      kind: 'job',
      title: `${running.name} ingested batch`,
      detail: `${running.id} +records`,
      nodeIds: [],
      delta: 20 + Math.floor(Math.random() * 80),
      agentId,
      severity: 'info',
    }
  }
  if (roll < 0.93) {
    const [a, b] = pick(PAIRS)
    const text = pick(LEARNINGS)(nodeLabel(nodes, a), nodeLabel(nodes, b))
    return {
      id,
      at: now,
      kind: 'learning',
      title: 'New playbook distilled',
      detail: text,
      nodeIds: [a, b],
      delta: 1,
      agentId,
      severity: 'info',
    }
  }
  if (roll < 0.97) {
    return {
      id,
      at: now,
      kind: 'milestone',
      title: 'Milestone spine advanced',
      detail: 'Gate / sail / arrive event landed',
      nodeIds: ['milestones', 'route', 'eta_updates'],
      delta: 1,
      agentId,
      shipment: shipment(),
      severity: 'info',
    }
  }
  return {
    id,
    at: now,
    kind: 'alert',
    title: 'Burst: Exceptions + Charges',
    detail: 'Co-occurrence velocity above 3σ — check demurrage / detention on open quotes',
    nodeIds: ['exceptions', 'charges', 'demurrage'],
    delta: 4,
    agentId,
    shipment: shipment(),
    severity: 'crit',
  }
}

export function startLiveEngine() {
  const timer = window.setInterval(() => {
    const s = useMemoryStore.getState()
    if (!s.live) return
    const n = Math.max(1, Math.round(s.liveSpeed))
    for (let i = 0; i < n; i++) s.applyLiveTick(synthesizeEvent())
  }, 850)
  return () => window.clearInterval(timer)
}
