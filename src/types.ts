export type Category = 'operations' | 'documents' | 'issues' | 'finance'

export type TabId = 'knowledge' | 'communities' | 'graph' | 'devwork' | 'jobs'

export type LabelMode = 'auto' | 'hubs' | 'all' | 'none'

export type VizMode = 'constellation' | 'heat' | 'community'

export type SidePanel = 'live' | 'links' | 'hubs' | 'bridges' | 'pins' | 'path'

export type LiveKind = 'cooccur' | 'extract' | 'learning' | 'job' | 'alert' | 'milestone'

export type Severity = 'info' | 'warn' | 'crit'

export interface LiveEvent {
  id: string
  at: string
  kind: LiveKind
  title: string
  detail: string
  nodeIds: string[]
  delta?: number
  agentId?: string
  shipment?: string
  severity?: Severity
}

export interface Agent {
  id: string
  name: string
  role: string
  status: 'idle' | 'running' | 'blocked'
  nodeId: string
  task: string
  tokens: number
  lastAt: string
}

export interface AlertItem {
  id: string
  at: string
  title: string
  detail: string
  nodeIds: string[]
  severity: Severity
  acked: boolean
}

export interface SituationBrief {
  at: string
  headline: string
  bullets: string[]
  threat: number
}

export interface Toast {
  id: string
  text: string
}

export type JobStatus = 'running' | 'completed' | 'failed'

export type DevKind = 'add' | 'merge' | 'detect' | 'reindex' | 'fix'

export interface MemoryNode {
  id: string
  label: string
  category: Category
  size: number
  description: string
  degree: number
  communityId: string
  trend: number[]
}

export interface MemoryLink {
  source: string
  target: string
  weight: number
}

export interface Learning {
  id: string
  text: string
  nodeIds: string[]
  source: string
  updatedAt: string
  category: Category
}

export interface Community {
  id: string
  name: string
  description: string
  nodeIds: string[]
  internalLinks: number
}

export interface DevEvent {
  id: string
  title: string
  detail: string
  at: string
  kind: DevKind
}

export interface Job {
  id: string
  name: string
  status: JobStatus
  cron: string
  lastRun: string
  records: number
  durationMs: number
}

export interface Snapshot {
  generatedAt: string
  nodes: MemoryNode[]
  links: MemoryLink[]
  knowledge: Learning[]
  communities: Community[]
  devwork: DevEvent[]
  jobs: Job[]
}

export interface SearchHit {
  kind: 'node' | 'learning'
  id: string
  title: string
  subtitle: string
  score: number
  nodeIds: string[]
}
