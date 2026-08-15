import type { MemoryLink, MemoryNode } from '../types'

export function networkMetrics(nodes: MemoryNode[], links: MemoryLink[]) {
  const n = nodes.length
  const m = links.length
  const possible = n > 1 ? (n * (n - 1)) / 2 : 1
  const density = m / possible
  const avgDegree = n ? nodes.reduce((s, x) => s + x.degree, 0) / n : 0
  const avgWeight = m ? links.reduce((s, l) => s + l.weight, 0) / m : 0
  const hubs = [...nodes].sort((a, b) => b.size - a.size).slice(0, 3)
  return { density, avgDegree, avgWeight, hubs }
}

export function weekHeat(node: MemoryNode, week: number): number {
  const v = node.trend[week] ?? 0
  const max = Math.max(...node.trend, 1)
  return v / max
}

export function heatHex(t: number): string {
  const x = Math.max(0, Math.min(1, t))
  if (x < 0.5) {
    const u = x * 2
    return mixHex('#3b82f6', '#d4af78', u)
  }
  return mixHex('#d4af78', '#fb7185', (x - 0.5) * 2)
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255
  const ag = (pa >> 8) & 255
  const ab = pa & 255
  const br = (pb >> 16) & 255
  const bg = (pb >> 8) & 255
  const bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

export const COMMUNITY_PALETTE = [
  '#d4af78',
  '#7eb6ff',
  '#5eead4',
  '#fb7185',
  '#c084fc',
  '#f5b97a',
  '#67e8f9',
]
