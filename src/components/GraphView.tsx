import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/categories'
import { formatInt } from '../lib/format'
import { networkMetrics } from '../lib/metrics'
import { pathWeight, strongestPath } from '../lib/path'
import { nodeById, useMemoryStore } from '../store'
import type { Category, LabelMode, VizMode } from '../types'
import { AgentDock } from './AgentDock'
import { AlertRail } from './AlertRail'
import { CommandStrip } from './CommandStrip'
import { GraphCanvas } from './GraphCanvas'
import { MiniMap, type MiniPos } from './MiniMap'
import { NodeDrawer } from './NodeDrawer'
import { SidePanel } from './SidePanel'

const LABELS: { id: LabelMode; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'hubs', label: 'Hubs' },
  { id: 'all', label: 'All' },
  { id: 'none', label: 'None' },
]

const VIZ: { id: VizMode; label: string }[] = [
  { id: 'constellation', label: 'Field' },
  { id: 'heat', label: 'Heat' },
  { id: 'community', label: 'Cluster' },
]

export function GraphView() {
  const nodes = useMemoryStore((s) => s.nodes)
  const links = useMemoryStore((s) => s.links)
  const graphMode = useMemoryStore((s) => s.graphMode)
  const setGraphMode = useMemoryStore((s) => s.setGraphMode)
  const selectedIds = useMemoryStore((s) => s.selectedIds)
  const hoveredId = useMemoryStore((s) => s.hoveredId)
  const focusedCommunityId = useMemoryStore((s) => s.focusedCommunityId)
  const searchActive = useMemoryStore((s) => s.searchActive)
  const searchHits = useMemoryStore((s) => s.searchHits)
  const communities = useMemoryStore((s) => s.communities)
  const minLinkWeight = useMemoryStore((s) => s.minLinkWeight)
  const setMinLinkWeight = useMemoryStore((s) => s.setMinLinkWeight)
  const labelMode = useMemoryStore((s) => s.labelMode)
  const setLabelMode = useMemoryStore((s) => s.setLabelMode)
  const categoryFilter = useMemoryStore((s) => s.categoryFilter)
  const setCategoryFilter = useMemoryStore((s) => s.setCategoryFilter)
  const autoRotate = useMemoryStore((s) => s.autoRotate)
  const setAutoRotate = useMemoryStore((s) => s.setAutoRotate)
  const vizMode = useMemoryStore((s) => s.vizMode)
  const setVizMode = useMemoryStore((s) => s.setVizMode)
  const weekIndex = useMemoryStore((s) => s.weekIndex)
  const setWeekIndex = useMemoryStore((s) => s.setWeekIndex)
  const playing = useMemoryStore((s) => s.playing)
  const setPlaying = useMemoryStore((s) => s.setPlaying)
  const cinema = useMemoryStore((s) => s.cinema)
  const setCinema = useMemoryStore((s) => s.setCinema)
  const setHelpOpen = useMemoryStore((s) => s.setHelpOpen)
  const hopDepth = useMemoryStore((s) => s.hopDepth)
  const setHopDepth = useMemoryStore((s) => s.setHopDepth)
  const touring = useMemoryStore((s) => s.touring)
  const setTouring = useMemoryStore((s) => s.setTouring)
  const particles = useMemoryStore((s) => s.particles)
  const toggleBookmark = useMemoryStore((s) => s.toggleBookmark)
  const setAtlasOpen = useMemoryStore((s) => s.setAtlasOpen)
  const setSettingsOpen = useMemoryStore((s) => s.setSettingsOpen)
  const setSidePanel = useMemoryStore((s) => s.setSidePanel)
  const live = useMemoryStore((s) => s.live)
  const setLive = useMemoryStore((s) => s.setLive)
  const lastEvent = useMemoryStore((s) => s.liveEvents[0])
  const [positions, setPositions] = useState<MiniPos[]>([])
  const [refit, setRefit] = useState(0)
  const toggleSelect = useMemoryStore((s) => s.toggleSelect)
  const openNode = useMemoryStore((s) => s.openNode)
  const setHovered = useMemoryStore((s) => s.setHovered)
  const clearSelection = useMemoryStore((s) => s.clearSelection)
  const clearCommunity = useMemoryStore((s) => s.clearCommunity)
  const closeDrawer = useMemoryStore((s) => s.closeDrawer)
  const drawerNodeId = useMemoryStore((s) => s.drawerNodeId)
  const visibleNodeIds = useMemoryStore((s) => s.visibleNodeIds)
  const visibleIds = visibleNodeIds()
  const community = communities.find((c) => c.id === focusedCommunityId)
  const hovered = hoveredId ? nodeById(nodes, hoveredId) : undefined

  const shownLinks = useMemo(
    () => links.filter((l) => l.weight >= minLinkWeight).length,
    [links, minLinkWeight],
  )

  const path = useMemo(() => {
    if (selectedIds.length < 2) return null
    return strongestPath(links, selectedIds[0], selectedIds[1])
  }, [links, selectedIds])

  const metrics = useMemo(() => networkMetrics(nodes, links), [nodes, links])

  const mix = useMemo(() => {
    const counts: Record<Category, number> = {
      operations: 0,
      documents: 0,
      issues: 0,
      finance: 0,
    }
    for (const n of nodes) counts[n.category] += 1
    return counts
  }, [nodes])

  useEffect(() => {
    if (!touring) return
    const hubs = [...nodes].sort((a, b) => b.size - a.size).slice(0, 8)
    let i = 0
    const step = () => {
      const hub = hubs[i % hubs.length]
      if (hub) useMemoryStore.getState().toggleSelect(hub.id, false)
      i += 1
    }
    step()
    const t = window.setInterval(step, 3400)
    return () => window.clearInterval(t)
  }, [nodes, touring])

  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      const w = useMemoryStore.getState().weekIndex
      setWeekIndex(w >= 15 ? 0 : w + 1)
    }, 680)
    return () => window.clearInterval(t)
  }, [playing, setWeekIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        if (useMemoryStore.getState().cinema || useMemoryStore.getState().touring) {
          setCinema(false)
          setTouring(false)
          return
        }
        closeDrawer()
        clearSelection()
        clearCommunity()
        setCategoryFilter(null)
      }
      if (e.key === 'f' || e.key === 'F') setCinema(!useMemoryStore.getState().cinema)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setHelpOpen(!useMemoryStore.getState().helpOpen)
      }
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying(!useMemoryStore.getState().playing)
      }
      if (e.key === '1') setVizMode('constellation')
      if (e.key === '2') setVizMode('heat')
      if (e.key === '3') setVizMode('community')
      if (e.key === 'r' || e.key === 'R') setRefit((n) => n + 1)
      if (e.key === 'b' || e.key === 'B') {
        const id = useMemoryStore.getState().selectedIds[0]
        if (id) toggleBookmark(id)
      }
      if (e.key === 'a' || e.key === 'A') setAtlasOpen(true)
      if (e.key === 't' || e.key === 'T') setTouring(!useMemoryStore.getState().touring)
      if (e.key === '[') setHopDepth(useMemoryStore.getState().hopDepth - 1)
      if (e.key === ']') setHopDepth(useMemoryStore.getState().hopDepth + 1)
      if (e.key === ',') setSettingsOpen(true)
      if (e.key === 'p' || e.key === 'P') setSidePanel('path')
      if (e.key === 'l' || e.key === 'L') setLive(!useMemoryStore.getState().live)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    clearCommunity,
    clearSelection,
    closeDrawer,
    setAtlasOpen,
    setCategoryFilter,
    setCinema,
    setHelpOpen,
    setHopDepth,
    setPlaying,
    setSettingsOpen,
    setLive,
    setSidePanel,
    setTouring,
    setVizMode,
    toggleBookmark,
  ])

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {!cinema && <CommandStrip />}
      <div className="relative flex min-h-0 flex-1">
      {!cinema && <AlertRail />}
      <div className="relative min-w-0 flex-1 overflow-hidden bg-canvas">
        <div className="stage-vignette absolute inset-0 z-[1]" />
        <div className="noise absolute inset-0 z-[1]" />
        <div className="scanlines absolute inset-0 z-[1]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3">
          <div className="pointer-events-auto glass-dark max-w-lg rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] tracking-[0.22em] text-accent uppercase">
                Retrieval field
              </div>
              <button
                type="button"
                onClick={() => setLive(!live)}
                className="font-mono text-[10px] text-accent"
              >
                {live ? '● LIVE' : '○ PAUSED'}
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="font-display text-[28px] leading-none text-ink">
                {formatInt(nodes.length)}
              </div>
              <div className="text-[11px] text-muted">subthemes</div>
              <div className="text-faint">·</div>
              <div className="font-display text-[28px] leading-none text-ink">
                {formatInt(shownLinks)}
              </div>
              <div className="text-[11px] text-muted">visible / {formatInt(links.length)}</div>
            </div>
            <div className="mt-1.5 text-[11px] text-faint">
              {formatInt(Math.round(metrics.avgDegree * 10) / 10)} avg deg ·{' '}
              {(metrics.density * 100).toFixed(1)}% dense · shift-select a second node
              for path
            </div>
            {lastEvent && (
              <div className="mt-2 truncate text-[11px] text-muted">
                <span className="font-mono text-[10px] text-accent uppercase">
                  {lastEvent.kind}
                </span>{' '}
                {lastEvent.title}
              </div>
            )}
            {path && path.length > 1 && (
              <div className="mt-2 rounded-lg border border-accent/25 bg-accent/10 px-2 py-1.5 text-[11.5px] text-accent">
                Path {nodeById(nodes, path[0])?.label} → {nodeById(nodes, path[path.length - 1])?.label}{' '}
                · {path.length - 1} hops · wt {formatInt(pathWeight(links, path))}
              </div>
            )}
            {(community || categoryFilter) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {community && (
                  <button
                    type="button"
                    onClick={clearCommunity}
                    className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent"
                  >
                    {community.name} ×
                  </button>
                )}
                {categoryFilter && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter(null)}
                    className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent"
                  >
                    {CATEGORY_META[categoryFilter].short} ×
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="glass-dark flex items-center rounded-xl p-0.5">
              {VIZ.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVizMode(item.id)}
                  className={`rounded-lg px-2 py-1 text-[11px] ${
                    vizMode === item.id ? 'bg-accent text-paper' : 'text-faint hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="glass-dark flex items-center rounded-xl p-0.5">
              {(['2d', '3d'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGraphMode(mode)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                    graphMode === mode ? 'bg-accent text-paper' : 'text-muted hover:text-ink'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="glass-dark flex items-center rounded-xl p-0.5">
              {LABELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLabelMode(item.id)}
                  className={`rounded-lg px-2 py-1 text-[11px] ${
                    labelMode === item.id ? 'bg-white/10 text-ink' : 'text-faint hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`glass-dark rounded-xl px-3 py-1.5 text-[11px] ${
                  autoRotate ? 'text-accent' : 'text-faint'
                }`}
              >
                {autoRotate ? 'Orbit' : 'Still'}
              </button>
              <button
                type="button"
                onClick={() => setCinema(!cinema)}
                className={`glass-dark rounded-xl px-3 py-1.5 text-[11px] ${
                  cinema ? 'text-accent' : 'text-faint'
                }`}
              >
                Cinema
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex w-[300px] flex-col gap-2">
          {hovered && (
            <div className="glass-dark rise rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_META[hovered.category].color }}
                />
                <div className="font-display text-[20px] leading-none">{hovered.label}</div>
              </div>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-muted">
                {hovered.description}
              </p>
              <div className="mt-2 flex gap-3 font-mono text-[10.5px] text-faint">
                <span>{hovered.degree} deg</span>
                <span>ctr {hovered.size.toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="pointer-events-auto glass-dark rounded-2xl px-3.5 py-3">
            <div className="mb-2 flex items-center justify-between text-[10.5px] tracking-[0.16em] text-faint uppercase">
              <span>Weight ≥ {minLinkWeight}</span>
              <span className="font-mono normal-case tracking-normal text-accent">
                {formatInt(shownLinks)}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={80}
              value={minLinkWeight}
              onChange={(e) => setMinLinkWeight(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="rounded-md border border-accent/30 px-2 py-0.5 text-[11px] text-accent"
              >
                {playing ? 'Pause' : 'Play'}
              </button>
              <input
                type="range"
                min={0}
                max={15}
                value={weekIndex}
                onChange={(e) => {
                  setPlaying(false)
                  setWeekIndex(Number(e.target.value))
                }}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10"
              />
              <span className="font-mono text-[10px] text-faint">W{weekIndex + 1}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] tracking-wide text-faint uppercase">Hops</span>
              {([1, 2, 3] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHopDepth(h)}
                  className={`h-6 w-6 rounded-md text-[11px] ${
                    hopDepth === h ? 'bg-accent text-paper' : 'border border-white/10 text-muted'
                  }`}
                >
                  {h}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTouring(!touring)}
                className={`ml-auto rounded-md px-2 py-0.5 text-[11px] ${
                  touring ? 'bg-accent/20 text-accent' : 'text-faint'
                }`}
              >
                {touring ? 'Stop tour' : 'Tour hubs'}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map((cat) => {
                const on = categoryFilter === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(on ? null : cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${
                      on
                        ? 'border-accent/40 bg-accent/10 text-ink'
                        : 'border-white/10 text-muted hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: CATEGORY_META[cat].color }}
                    />
                    {CATEGORY_META[cat].short}
                    <span className="font-mono text-[10px] text-faint">{mix[cat]}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-3">
              <MiniMap positions={positions} selectedIds={selectedIds} />
            </div>
          </div>
        </div>

        <GraphCanvas
          nodes={nodes}
          links={links}
          mode={graphMode}
          visibleIds={visibleIds}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          focusToken={
            focusedCommunityId ??
            (searchActive && searchHits.length ? 'search' : null) ??
            (refit ? `refit-${refit}` : null)
          }
          minLinkWeight={minLinkWeight}
          labelMode={labelMode}
          autoRotate={autoRotate}
          vizMode={vizMode}
          weekIndex={weekIndex}
          pathIds={path ?? []}
          particles={particles}
          onPositions={setPositions}
          onSelect={toggleSelect}
          onOpen={openNode}
          onHover={setHovered}
          onBackground={() => {
            clearSelection()
            clearCommunity()
          }}
        />
        <NodeDrawer key={drawerNodeId ?? 'closed'} />
      </div>
      {!cinema && <SidePanel />}
      </div>
      {!cinema && <AgentDock />}
    </div>
  )
}
