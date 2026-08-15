import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import SpriteText from 'three-spritetext'
import { rgba } from '../lib/color'
import { clusterForce } from '../lib/graph-force'
import { nodeLookColor } from '../lib/look'
import { weekHeat } from '../lib/metrics'
import type { LabelMode, MemoryLink, MemoryNode, VizMode } from '../types'
import { useMemoryStore } from '../store'
import type { MiniPos } from './MiniMap'

const ForceGraph2D = lazy(() => import('react-force-graph-2d'))
const ForceGraph3D = lazy(() => import('react-force-graph-3d'))

const STAGE = '#03040a'

export interface GraphNode extends MemoryNode {
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
  __threeObj?: THREE.Object3D
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  weight: number
}

interface OrbitControlsLike {
  autoRotate: boolean
  autoRotateSpeed: number
}

interface ComposerLike {
  addPass: (pass: unknown) => void
}

interface GraphApi {
  d3Force: (
    name: string,
    force?: unknown,
  ) =>
    | {
        strength?: (v: unknown) => unknown
        distance?: (v: unknown) => { strength: (v: unknown) => unknown }
      }
    | undefined
  d3ReheatSimulation: () => void
  zoomToFit?: (ms?: number, pad?: number) => void
  scene?: () => THREE.Scene
  cameraPosition?: (
    pos?: { x: number; y: number; z: number },
    lookAt?: { x: number; y: number; z: number },
    ms?: number,
  ) => void
  controls?: () => OrbitControlsLike
  postProcessingComposer?: () => ComposerLike
}

interface Props {
  nodes: MemoryNode[]
  links: MemoryLink[]
  mode: '2d' | '3d'
  visibleIds: Set<string> | null
  selectedIds: string[]
  hoveredId: string | null
  focusToken: string | null
  minLinkWeight: number
  labelMode: LabelMode
  autoRotate: boolean
  vizMode: VizMode
  weekIndex: number
  pathIds: string[]
  particles: boolean
  onSelect: (id: string, additive: boolean) => void
  onOpen: (id: string) => void
  onHover: (id: string | null) => void
  onBackground: () => void
  onPositions?: (pts: MiniPos[]) => void
}

function endId(end: string | GraphNode): string {
  return typeof end === 'string' ? end : end.id
}

function shouldLabel(node: GraphNode, mode: LabelMode, selected: boolean, hovered: boolean) {
  if (selected || hovered) return true
  if (mode === 'none') return false
  if (mode === 'all') return true
  if (mode === 'hubs') return node.size > 20
  return node.size > 26
}

function makeStars(count = 2200) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 2600
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2600
    pos[i * 3 + 2] = (Math.random() - 0.5) * 2600
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xc9b896,
      size: 1.15,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  )
}

export function GraphCanvas({
  nodes,
  links,
  mode,
  visibleIds,
  selectedIds,
  hoveredId,
  focusToken,
  minLinkWeight,
  labelMode,
  autoRotate,
  vizMode,
  weekIndex,
  pathIds,
  particles,
  onSelect,
  onOpen,
  onHover,
  onBackground,
  onPositions,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<GraphApi | null>(null)
  const lastClick = useRef<{ id: string; t: number }>({ id: '', t: 0 })
  const fitted = useRef(false)
  const staged = useRef(false)
  const tick = useRef(0)
  const vizRef = useRef(vizMode)
  const weekRef = useRef(weekIndex)
  const pathRef = useRef(new Set(pathIds))
  const visRef = useRef(visibleIds)
  const posRef = useRef(onPositions)
  vizRef.current = vizMode
  weekRef.current = weekIndex
  pathRef.current = new Set(pathIds)
  visRef.current = visibleIds
  posRef.current = onPositions
  const hotRef = useRef<Record<string, number>>({})
  const [size, setSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    hotRef.current = useMemoryStore.getState().hotNodes
    return useMemoryStore.subscribe((s) => {
      hotRef.current = s.hotNodes
    })
  }, [])

  const graphData = useMemo(() => {
    return {
      nodes: nodes.map((n) => ({ ...n })) as GraphNode[],
      links: links.map((l) => ({ ...l })) as GraphLink[],
    }
  }, [nodes, links])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const applyForces = useCallback(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('charge')?.strength?.(mode === '3d' ? -120 : -140)
    fg.d3Force('link')
      ?.distance?.((l: GraphLink) => 40 + 130 / Math.sqrt(l.weight || 1))
      ?.strength?.(0.045)
    fg.d3Force('cluster', clusterForce(mode === '3d' ? 0.055 : 0.09))
    fg.d3ReheatSimulation()
  }, [mode])

  useEffect(() => {
    fitted.current = false
    staged.current = false
    const t = window.setTimeout(applyForces, 40)
    return () => window.clearTimeout(t)
  }, [applyForces, graphData, mode])

  useEffect(() => {
    if (mode !== '3d') return
    const t = window.setTimeout(() => {
      const fg = fgRef.current
      const scene = fg?.scene?.()
      if (!fg || !scene || staged.current) return
      staged.current = true
      scene.background = new THREE.Color(STAGE)
      scene.fog = new THREE.FogExp2(STAGE, 0.0048)
      scene.add(new THREE.AmbientLight('#c9b896', 0.55))
      const key = new THREE.DirectionalLight('#fff4dd', 1.05)
      key.position.set(90, 160, 70)
      scene.add(key)
      const rim = new THREE.PointLight('#7eb6ff', 2.4, 1100)
      rim.position.set(-140, -20, 180)
      scene.add(rim)
      const gold = new THREE.PointLight('#d4af78', 1.6, 900)
      gold.position.set(160, -70, -50)
      scene.add(gold)
      scene.add(makeStars())

      try {
        const composer = fg.postProcessingComposer?.()
        composer?.addPass(
          new UnrealBloomPass(new THREE.Vector2(size.w || 900, size.h || 640), 0.55, 0.4, 0.2),
        )
      } catch {
        /* WebGL postprocess is optional */
      }

      fg.cameraPosition?.({ x: 40, y: 220, z: 520 }, { x: 0, y: 0, z: 0 }, 0)
      fg.cameraPosition?.({ x: 18, y: 72, z: 265 }, { x: 0, y: 0, z: 0 }, 2400)
    }, 90)
    return () => window.clearTimeout(t)
  }, [mode, graphData, size.h, size.w])

  useEffect(() => {
    const controls = fgRef.current?.controls?.()
    if (!controls) return
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.45
  }, [autoRotate, mode, graphData])

  useEffect(() => {
    if (!focusToken) return
    const t = window.setTimeout(() => {
      fgRef.current?.zoomToFit?.(800, mode === '3d' ? 100 : 52)
    }, 200)
    return () => window.clearTimeout(t)
  }, [focusToken, mode])

  useEffect(() => {
    if (mode !== '3d' || selectedIds.length !== 1) return
    const node = graphData.nodes.find((n) => n.id === selectedIds[0])
    if (!node || node.x === undefined) return
    const fg = fgRef.current
    const controls = fg?.controls?.()
    const prev = controls?.autoRotate
    if (controls) controls.autoRotate = false
    fg?.cameraPosition?.(
      { x: node.x + 34, y: (node.y ?? 0) + 26, z: (node.z ?? 0) + 70 },
      { x: node.x, y: node.y ?? 0, z: node.z ?? 0 },
      1050,
    )
    const t = window.setTimeout(() => {
      if (controls) controls.autoRotate = prev ?? autoRotate
    }, 1150)
    return () => window.clearTimeout(t)
  }, [autoRotate, graphData.nodes, mode, selectedIds])

  const isHot = useCallback(
    (id: string) => !visibleIds || visibleIds.has(id),
    [visibleIds],
  )

  const handleClick = useCallback(
    (node: GraphNode, ev: MouseEvent) => {
      const now = Date.now()
      if (ev.shiftKey) {
        onSelect(node.id, true)
        lastClick.current = { id: '', t: 0 }
        return
      }
      if (lastClick.current.id === node.id && now - lastClick.current.t < 360) {
        onOpen(node.id)
        lastClick.current = { id: '', t: 0 }
        return
      }
      lastClick.current = { id: node.id, t: now }
      onSelect(node.id, false)
    },
    [onOpen, onSelect],
  )

  const nodeColor = useCallback(
    (node: GraphNode) =>
      nodeLookColor(node, vizMode, weekIndex, pathIds.length ? new Set(pathIds) : null, visibleIds),
    [pathIds, visibleIds, vizMode, weekIndex],
  )

  const linkVisible = useCallback(
    (link: GraphLink) => link.weight >= minLinkWeight,
    [minLinkWeight],
  )

  const linkColor = useCallback(
    (link: GraphLink) => {
      const s = endId(link.source)
      const t = endId(link.target)
      const hot = !visibleIds || (visibleIds.has(s) && visibleIds.has(t))
      const onPath =
        pathIds.length > 1 && pathIds.includes(s) && pathIds.includes(t) &&
        Math.abs(pathIds.indexOf(s) - pathIds.indexOf(t)) === 1
      if (onPath) return 'rgba(243,221,176,0.98)'
      if (!hot) return 'rgba(148,163,184,0.03)'
      if (visibleIds) return 'rgba(212,175,120,0.5)'
      const a = 0.05 + Math.min(link.weight, 180) / 480
      return `rgba(168,176,196,${a})`
    },
    [pathIds, visibleIds],
  )

  const linkWidth = useCallback(
    (link: GraphLink) => {
      const s = endId(link.source)
      const t = endId(link.target)
      const hot = !visibleIds || (visibleIds.has(s) && visibleIds.has(t))
      const base = 0.22 + Math.sqrt(link.weight) / 13
      return hot ? base : 0.06
    },
    [visibleIds],
  )

  const nodeLabel = useCallback((node: GraphNode) => {
    return `<div class="graph-tooltip"><div style="font-weight:600;letter-spacing:.02em">${node.label}</div><div style="opacity:.65;margin-top:2px;font-size:11px">${node.category} · ${node.degree} links</div></div>`
  }, [])

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const r = Math.max(2.6, Math.sqrt(node.size) * 1.62)
      const hot = isHot(node.id)
      const selected = selectedIds.includes(node.id)
      const hovered = hoveredId === node.id
      const color = nodeLookColor(
        node,
        vizMode,
        weekIndex,
        pathIds.length ? new Set(pathIds) : null,
        visibleIds,
      )

      ctx.save()
      ctx.globalAlpha = hot ? 1 : 0.08

      if (hot && (selected || hovered || node.size > 16)) {
        const glow = ctx.createRadialGradient(x, y, r * 0.15, x, y, r * 4.2)
        glow.addColorStop(0, rgba(color, 0.55))
        glow.addColorStop(1, rgba(color, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, r * 4.2, 0, Math.PI * 2)
        ctx.fill()
      }

      const fill = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r)
      fill.addColorStop(0, '#fff8ea')
      fill.addColorStop(0.18, color)
      fill.addColorStop(1, rgba(color, 0.7))
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()

      ctx.lineWidth = (selected ? 2.4 : 0.9) / Math.max(globalScale, 0.55)
      ctx.strokeStyle = selected || hovered ? '#f3ddb0' : rgba('#ffffff', 0.28)
      ctx.stroke()

      const show = shouldLabel(node, labelMode, selected, hovered) && hot
      if (
        show &&
        (labelMode === 'all' || globalScale > 0.85 || selected || hovered || node.size > 22)
      ) {
        const fontSize = Math.max(11 / globalScale, 2.8)
        ctx.font = `500 ${fontSize}px "IBM Plex Sans", system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const label = node.label
        const padX = 3.4
        const w = ctx.measureText(label).width
        const ly = y + r + fontSize * 1.15
        ctx.globalAlpha = hot ? 0.94 : 0.2
        ctx.fillStyle = 'rgba(3,4,10,0.78)'
        const rw = w + padX * 2
        const rh = fontSize * 1.45
        const rx = x - rw / 2
        const ry = ly - rh / 2
        ctx.beginPath()
        ctx.roundRect(rx, ry, rw, rh, 2.2)
        ctx.fill()
        ctx.fillStyle = '#f3ddb0'
        ctx.fillText(label, x, ly)
      }

      ctx.restore()
    },
    [hoveredId, isHot, labelMode, pathIds, selectedIds, visibleIds, vizMode, weekIndex],
  )

  const paintPointer = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const r = Math.max(2.6, Math.sqrt(node.size) * 1.62)
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, r + 1.6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    },
    [],
  )

  const nodeThreeObject = useCallback(
    (node: GraphNode) => {
      const r = Math.max(1.4, Math.sqrt(node.size) * 0.56)
      const color = new THREE.Color(nodeLookColor(node, vizMode, weekIndex, null, null))
      const group = new THREE.Group()
      group.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 24),
          new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.72,
            roughness: 0.22,
            metalness: 0.35,
          }),
        ),
      )
      group.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(r * 1.85, 16, 16),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.16,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      )
      if (shouldLabel(node, labelMode, false, false)) {
        const sprite = new SpriteText(node.label)
        sprite.color = '#f3ddb0'
        sprite.textHeight = 2.55
        sprite.fontFace = 'IBM Plex Sans, system-ui, sans-serif'
        sprite.fontWeight = '500'
        sprite.backgroundColor = 'rgba(3,4,10,0.55)'
        sprite.padding = 1.3
        sprite.borderRadius = 2
        sprite.position.y = r + 2.4
        group.add(sprite)
      }
      return group
    },
    [labelMode, vizMode, weekIndex],
  )

  const common = {
    ref: fgRef,
    graphData,
    width: size.w,
    height: size.h,
    backgroundColor: STAGE,
    nodeId: 'id',
    nodeVal: (n: GraphNode) => n.size,
    nodeColor,
    nodeLabel,
    nodeOpacity: 0.98,
    linkColor,
    linkWidth,
    linkVisibility: linkVisible,
    linkOpacity: 0.92,
    cooldownTicks: 160,
    warmupTicks: 60,
    enableNodeDrag: true,
    onNodeClick: handleClick,
    onNodeHover: (node: GraphNode | null) => onHover(node?.id ?? null),
    onBackgroundClick: onBackground,
    onEngineTick: () => {
      try {
      tick.current += 1
      if (tick.current % 6 === 0 && posRef.current) {
        posRef.current(
          graphData.nodes.map((n) => ({
            id: n.id,
            x: n.x ?? 0,
            y: n.y ?? 0,
            z: n.z ?? 0,
            category: n.category,
          })),
        )
      }
      if (mode !== '3d') return
      const path = pathRef.current
      const vis = visRef.current
      const week = weekRef.current
      const viz = vizRef.current
      for (const n of graphData.nodes) {
        const g = n.__threeObj
        if (!g) continue
        const hot = !vis || vis.has(n.id)
        const liveHot = (hotRef.current[n.id] ?? 0) > Date.now()
        const pulse = 0.62 + weekHeat(n, week) * 0.85
        const liveBoost = liveHot ? 1.22 : 1
        g.scale.setScalar((viz === 'heat' ? pulse : hot ? 1 : 0.55) * liveBoost)
        const col = new THREE.Color(
          nodeLookColor(n, viz, week, path.size ? path : null, vis),
        )
        const mesh = g.children[0]
        if (mesh instanceof THREE.Mesh && mesh.material && 'color' in mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.color.copy(col)
          if (mat.emissive) mat.emissive.copy(col)
        }
        const halo = g.children[1]
        if (halo instanceof THREE.Mesh && halo.material && 'opacity' in halo.material) {
          const hm = halo.material as THREE.MeshBasicMaterial
          hm.opacity = hot ? 0.16 + weekHeat(n, week) * 0.22 : 0.04
          hm.color.copy(col)
        }
      }
      } catch {
        /* keep simulation running */
      }
    },
    onEngineStop: () => {
      if (fitted.current) return
      fitted.current = true
      window.setTimeout(() => {
        fgRef.current?.zoomToFit?.(1100, mode === '3d' ? 92 : 42)
      }, mode === '3d' ? 1600 : 80)
    },
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Suspense
        fallback={
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[12px] tracking-[0.22em] text-faint uppercase">
            <span className="gold-text font-display text-2xl tracking-[0.18em] normal-case">
              Memory
            </span>
            Composing graph
          </div>
        }
      >
        {mode === '3d' ? (
          <ForceGraph3D
            {...common}
            controlType="orbit"
            showNavInfo={false}
            rendererConfig={{ antialias: true, alpha: false }}
            nodeResolution={24}
            nodeThreeObject={nodeThreeObject}
            nodeThreeObjectExtend={false}
            linkResolution={8}
            linkDirectionalParticles={(l: GraphLink) => {
              const s = endId(l.source)
              const t = endId(l.target)
              const onPath =
                pathIds.length > 1 &&
                pathIds.includes(s) &&
                pathIds.includes(t) &&
                Math.abs(pathIds.indexOf(s) - pathIds.indexOf(t)) === 1
              if (!particles) return 0
              if (onPath) return 7
              return l.weight >= 90 ? 4 : l.weight >= 40 ? 2 : 0
            }}
            linkDirectionalParticleWidth={1.35}
            linkDirectionalParticleSpeed={0.0042}
            linkDirectionalParticleColor={() => '#f3ddb0'}
          />
        ) : (
          <ForceGraph2D
            {...common}
            nodeCanvasObject={paintNode}
            nodeCanvasObjectMode={() => 'replace'}
            nodePointerAreaPaint={paintPointer}
          />
        )}
      </Suspense>
    </div>
  )
}
