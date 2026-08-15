import { create } from 'zustand'
import snapshot from './data/snapshot.json'
import { SEED_AGENTS } from './lib/agents'
import { composeBrief } from './lib/briefing'
import { egoNetwork } from './lib/ego'
import { strongestPath } from './lib/path'
import { loadPrefs } from './lib/prefs'
import { searchMemory } from './lib/search'
import type {
  Agent,
  AlertItem,
  Category,
  Community,
  DevEvent,
  Job,
  LabelMode,
  Learning,
  LiveEvent,
  MemoryLink,
  MemoryNode,
  SearchHit,
  SidePanel,
  SituationBrief,
  Snapshot,
  TabId,
  Toast,
  VizMode,
} from './types'

const prefs = loadPrefs()

const initial = snapshot as Snapshot

export interface MemoryState {
  tab: TabId
  graphMode: '2d' | '3d'
  query: string
  searchHits: SearchHit[]
  searchActive: boolean
  selectedIds: string[]
  focusedCommunityId: string | null
  drawerNodeId: string | null
  hoveredId: string | null
  importError: string | null
  importOpen: boolean
  generatedAt: string
  minLinkWeight: number
  labelMode: LabelMode
  categoryFilter: Category | null
  autoRotate: boolean
  searchOpen: boolean
  vizMode: VizMode
  weekIndex: number
  playing: boolean
  cinema: boolean
  helpOpen: boolean
  hopDepth: number
  bookmarks: string[]
  notes: Record<string, string>
  sidePanel: SidePanel
  settingsOpen: boolean
  atlasOpen: boolean
  touring: boolean
  particles: boolean
  toasts: Toast[]
  live: boolean
  liveSpeed: number
  followLive: boolean
  liveEvents: LiveEvent[]
  liveTimes: number[]
  hotNodes: Record<string, number>
  ingestCount: number
  agents: Agent[]
  alerts: AlertItem[]
  brief: SituationBrief
  nodes: MemoryNode[]
  links: MemoryLink[]
  knowledge: Learning[]
  communities: Community[]
  devwork: DevEvent[]
  jobs: Job[]
  knowledgeFilter: 'all' | Learning['category']
  knowledgeQuery: string
  setTab: (tab: TabId) => void
  setGraphMode: (mode: '2d' | '3d') => void
  setQuery: (query: string) => void
  runSearch: () => void
  clearSearch: () => void
  toggleSelect: (id: string, additive: boolean) => void
  selectPair: (a: string, b: string) => void
  clearSelection: () => void
  openNode: (id: string) => void
  closeDrawer: () => void
  setHovered: (id: string | null) => void
  focusCommunity: (id: string) => void
  clearCommunity: () => void
  setKnowledgeFilter: (v: MemoryState['knowledgeFilter']) => void
  setKnowledgeQuery: (q: string) => void
  setImportOpen: (open: boolean) => void
  setMinLinkWeight: (n: number) => void
  setLabelMode: (m: LabelMode) => void
  setCategoryFilter: (c: Category | null) => void
  setAutoRotate: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  setVizMode: (v: VizMode) => void
  setWeekIndex: (n: number) => void
  setPlaying: (v: boolean) => void
  setCinema: (v: boolean) => void
  setHelpOpen: (v: boolean) => void
  setHopDepth: (n: number) => void
  toggleBookmark: (id: string) => void
  setNote: (id: string, text: string) => void
  setSidePanel: (p: SidePanel) => void
  setSettingsOpen: (v: boolean) => void
  setAtlasOpen: (v: boolean) => void
  setTouring: (v: boolean) => void
  setParticles: (v: boolean) => void
  pushToast: (text: string) => void
  dismissToast: (id: string) => void
  setLive: (v: boolean) => void
  setLiveSpeed: (n: number) => void
  setFollowLive: (v: boolean) => void
  applyLiveTick: (event: LiveEvent) => void
  ackAlert: (id: string) => void
  ackAllAlerts: () => void
  importSnapshot: (raw: unknown) => void
  visibleNodeIds: () => Set<string> | null
  liveEps: () => number
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  tab: 'graph',
  graphMode: prefs.graphMode ?? '3d',
  query: '',
  searchHits: [],
  searchActive: false,
  selectedIds: [],
  focusedCommunityId: null,
  drawerNodeId: null,
  hoveredId: null,
  importError: null,
  importOpen: false,
  generatedAt: initial.generatedAt,
  minLinkWeight: prefs.minLinkWeight ?? 16,
  labelMode: prefs.labelMode ?? 'auto',
  categoryFilter: null,
  autoRotate: prefs.autoRotate ?? true,
  searchOpen: false,
  vizMode: prefs.vizMode ?? 'constellation',
  weekIndex: 15,
  playing: false,
  cinema: false,
  helpOpen: false,
  hopDepth: prefs.hopDepth ?? 1,
  bookmarks: prefs.bookmarks ?? [],
  notes: prefs.notes ?? {},
  sidePanel: 'live',
  settingsOpen: false,
  atlasOpen: false,
  touring: false,
  particles: prefs.particles ?? true,
  toasts: [],
  live: true,
  liveSpeed: 1,
  followLive: false,
  liveEvents: [],
  liveTimes: [],
  hotNodes: {},
  ingestCount: 0,
  agents: SEED_AGENTS,
  alerts: [],
  brief: {
    at: new Date().toISOString(),
    headline: 'Memory field coming online',
    bullets: ['Waiting for first live window'],
    threat: 4,
  },
  nodes: initial.nodes,
  links: initial.links,
  knowledge: initial.knowledge,
  communities: initial.communities,
  devwork: initial.devwork,
  jobs: initial.jobs,
  knowledgeFilter: 'all',
  knowledgeQuery: '',

  setTab: (tab) => set({ tab }),
  setGraphMode: (graphMode) => set({ graphMode }),
  setQuery: (query) => set({ query }),

  runSearch: () => {
    const { query, nodes, knowledge } = get()
    const searchHits = searchMemory(query, nodes, knowledge)
    set({
      searchHits,
      searchActive: query.trim().length > 0,
      focusedCommunityId: null,
    })
  },

  clearSearch: () =>
    set({
      query: '',
      searchHits: [],
      searchActive: false,
    }),

  toggleSelect: (id, additive) => {
    const { selectedIds } = get()
    if (additive) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
      set({ selectedIds: next, focusedCommunityId: null })
      return
    }
    set({ selectedIds: [id], focusedCommunityId: null })
  },

  selectPair: (a, b) =>
    set({ selectedIds: [a, b], focusedCommunityId: null, searchActive: false }),

  clearSelection: () => set({ selectedIds: [] }),

  openNode: (id) =>
    set({
      drawerNodeId: id,
      selectedIds: [id],
      tab: 'graph',
    }),

  closeDrawer: () => set({ drawerNodeId: null }),

  setHovered: (hoveredId) => set({ hoveredId }),

  focusCommunity: (id) =>
    set({
      tab: 'graph',
      focusedCommunityId: id,
      selectedIds: [],
      searchActive: false,
      searchHits: [],
    }),

  clearCommunity: () => set({ focusedCommunityId: null }),

  setKnowledgeFilter: (knowledgeFilter) => set({ knowledgeFilter }),
  setKnowledgeQuery: (knowledgeQuery) => set({ knowledgeQuery }),
  setImportOpen: (importOpen) => set({ importOpen, importError: null }),
  setMinLinkWeight: (minLinkWeight) => set({ minLinkWeight }),
  setLabelMode: (labelMode) => set({ labelMode }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setVizMode: (vizMode) => set({ vizMode }),
  setWeekIndex: (weekIndex) => set({ weekIndex }),
  setPlaying: (playing) => set({ playing }),
  setCinema: (cinema) => set({ cinema }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  setHopDepth: (hopDepth) => set({ hopDepth: Math.min(3, Math.max(1, hopDepth)) }),
  toggleBookmark: (id) => {
    const { bookmarks } = get()
    const next = bookmarks.includes(id)
      ? bookmarks.filter((x) => x !== id)
      : [id, ...bookmarks]
    set({ bookmarks: next })
    get().pushToast(next.includes(id) ? 'Pinned to memory' : 'Unpinned')
  },
  setNote: (id, text) => set({ notes: { ...get().notes, [id]: text } }),
  setSidePanel: (sidePanel) => set({ sidePanel }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setAtlasOpen: (atlasOpen) => set({ atlasOpen }),
  setTouring: (touring) => set({ touring, cinema: touring ? true : get().cinema }),
  setParticles: (particles) => set({ particles }),
  pushToast: (text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set({ toasts: [...get().toasts, { id, text }].slice(-4) })
    window.setTimeout(() => get().dismissToast(id), 3200)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  setLive: (live) => set({ live }),
  setLiveSpeed: (liveSpeed) => set({ liveSpeed: Math.max(0.5, Math.min(4, liveSpeed)) }),
  setFollowLive: (followLive) => set({ followLive }),
  ackAlert: (id) =>
    set({
      alerts: get().alerts.map((a) => (a.id === id ? { ...a, acked: true } : a)),
    }),
  ackAllAlerts: () =>
    set({ alerts: get().alerts.map((a) => ({ ...a, acked: true })) }),
  liveEps: () => {
    const now = Date.now()
    return get().liveTimes.filter((t) => now - t < 5000).length / 5
  },
  applyLiveTick: (event) => {
    const state = get()
    const now = Date.now()
    const hotNodes = { ...state.hotNodes }
    for (const id of Object.keys(hotNodes)) {
      if (hotNodes[id] < now) delete hotNodes[id]
    }
    for (const id of event.nodeIds) hotNodes[id] = now + 4200

    if (event.kind === 'cooccur' || event.kind === 'alert' || event.kind === 'milestone') {
      if (event.nodeIds.length >= 2) {
        const a = event.nodeIds[0]
        const b = event.nodeIds[1]
        const link = state.links.find(
          (l) => (l.source === a && l.target === b) || (l.source === b && l.target === a),
        )
        if (link) link.weight += event.delta ?? 1
      }
      for (const id of event.nodeIds) {
        const node = state.nodes.find((n) => n.id === id)
        if (!node) continue
        const trend = node.trend.slice()
        trend[15] = (trend[15] ?? 0) + 1
        node.trend = trend
        node.size = Math.min(48, +(node.size + 0.035).toFixed(3))
      }
    }

    let jobs = state.jobs
    if (event.kind === 'job' || event.kind === 'extract') {
      jobs = state.jobs.map((j) =>
        j.status === 'running'
          ? {
              ...j,
              records: j.records + (event.delta ?? 12),
              lastRun: event.at,
            }
          : j,
      )
    }

    let knowledge = state.knowledge
    if (event.kind === 'learning') {
      knowledge = [
        {
          id: `learn_live_${event.id}`,
          text: event.detail,
          nodeIds: event.nodeIds,
          source: 'Học từ stream vận hành realtime',
          updatedAt: event.at,
          category: 'operations' as const,
        },
        ...state.knowledge,
      ].slice(0, 80)
    }

    let selectedIds = state.selectedIds
    if (state.followLive && event.nodeIds[0] && !state.drawerNodeId) {
      selectedIds = [event.nodeIds[0]]
    }

    if (event.kind === 'alert') {
      state.pushToast(event.title)
    }

    const agents = state.agents.map((ag, i) => {
      if (event.agentId && ag.id === event.agentId) {
        return {
          ...ag,
          status: event.kind === 'alert' ? 'blocked' : 'running',
          nodeId: event.nodeIds[0] ?? ag.nodeId,
          task: event.title,
          tokens: ag.tokens + 40 + Math.floor(Math.random() * 90),
          lastAt: event.at,
        } as Agent
      }
      if (i % 5 === (state.liveEvents.length % 5) && ag.status === 'idle') {
        return { ...ag, status: 'running' as const, lastAt: event.at }
      }
      return ag
    })

    let alerts = state.alerts
    if (event.kind === 'alert' || event.severity === 'crit') {
      alerts = [
        {
          id: `al_${event.id}`,
          at: event.at,
          title: event.title,
          detail: event.detail,
          nodeIds: event.nodeIds,
          severity: event.severity ?? 'warn',
          acked: false,
        },
        ...state.alerts,
      ].slice(0, 40)
    }

    const nextEvents = [event, ...state.liveEvents].slice(0, 120)
    const brief =
      nextEvents.length % 10 === 0 ? composeBrief(nextEvents, alerts) : state.brief

    set({
      hotNodes,
      jobs,
      knowledge,
      selectedIds,
      agents,
      alerts,
      brief,
      liveEvents: [event, ...state.liveEvents].slice(0, 120),
      liveTimes: [...state.liveTimes, now].filter((t) => now - t < 8000),
      ingestCount: state.ingestCount + (event.delta ?? 1),
    })
  },

  importSnapshot: (raw) => {
    try {
      const data = parseSnapshot(raw)
      set({
        nodes: data.nodes,
        links: data.links,
        knowledge: data.knowledge ?? get().knowledge,
        communities: data.communities ?? get().communities,
        devwork: data.devwork ?? get().devwork,
        jobs: data.jobs ?? get().jobs,
        importOpen: false,
        importError: null,
        selectedIds: [],
        drawerNodeId: null,
        focusedCommunityId: null,
        searchActive: false,
        searchHits: [],
        generatedAt:
          isRecord(raw) && typeof raw.generatedAt === 'string'
            ? raw.generatedAt
            : get().generatedAt,
      })
    } catch (err) {
      set({
        importError: err instanceof Error ? err.message : 'Invalid snapshot',
      })
    }
  },

  visibleNodeIds: () => {
    const {
      selectedIds,
      focusedCommunityId,
      searchActive,
      searchHits,
      communities,
      links,
      categoryFilter,
      nodes,
    } = get()
    let ids: Set<string> | null = null
    if (selectedIds.length >= 2) {
      const path = strongestPath(links, selectedIds[0], selectedIds[1])
      ids = path ? new Set(path) : egoNetwork(links, selectedIds, get().hopDepth)
    } else if (selectedIds.length > 0) {
      ids = egoNetwork(links, selectedIds, get().hopDepth)
    }
    else if (focusedCommunityId) {
      const c = communities.find((x) => x.id === focusedCommunityId)
      ids = c ? new Set(c.nodeIds) : null
    } else if (searchActive && searchHits.length > 0) {
      ids = new Set<string>()
      for (const hit of searchHits) for (const id of hit.nodeIds) ids.add(id)
      if (!ids.size) ids = null
    }
    if (categoryFilter) {
      const cat = new Set(
        nodes.filter((n) => n.category === categoryFilter).map((n) => n.id),
      )
      if (!ids) return cat
      return new Set([...ids].filter((id) => cat.has(id)))
    }
    return ids
  },
}))

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function parseSnapshot(raw: unknown): {
  nodes: MemoryNode[]
  links: MemoryLink[]
  knowledge?: Learning[]
  communities?: Community[]
  devwork?: DevEvent[]
  jobs?: Job[]
} {
  if (!isRecord(raw)) throw new Error('Snapshot must be a JSON object')
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.links)) {
    throw new Error('Snapshot needs nodes[] and links[]')
  }
  if (raw.nodes.length === 0) throw new Error('Snapshot has no nodes')
  const nodes = raw.nodes as MemoryNode[]
  const links = raw.links as MemoryLink[]
  for (const n of nodes) {
    if (!n.id || !n.label) throw new Error('Each node needs id and label')
  }
  return {
    nodes,
    links,
    knowledge: raw.knowledge as Learning[] | undefined,
    communities: raw.communities as Community[] | undefined,
    devwork: raw.devwork as DevEvent[] | undefined,
    jobs: raw.jobs as Job[] | undefined,
  }
}

export function nodeById(nodes: MemoryNode[], id: string): MemoryNode | undefined {
  return nodes.find((n) => n.id === id)
}

export function strongestLinks(links: MemoryLink[], limit = 12): MemoryLink[] {
  return [...links].sort((a, b) => b.weight - a.weight).slice(0, limit)
}
