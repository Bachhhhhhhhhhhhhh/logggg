import type { MemoryLink } from '../types'

export function strongestPath(
  links: MemoryLink[],
  source: string,
  target: string,
): string[] | null {
  if (source === target) return [source]
  const adj = new Map<string, { to: string; w: number }[]>()
  for (const link of links) {
    if (!adj.has(link.source)) adj.set(link.source, [])
    if (!adj.has(link.target)) adj.set(link.target, [])
    adj.get(link.source)?.push({ to: link.target, w: link.weight })
    adj.get(link.target)?.push({ to: link.source, w: link.weight })
  }
  if (!adj.has(source) || !adj.has(target)) return null

  const dist = new Map<string, number>()
  const prev = new Map<string, string>()
  const used = new Set<string>()
  dist.set(source, 0)

  while (used.size < adj.size) {
    let best: string | null = null
    let bestD = Infinity
    for (const [id] of adj) {
      if (used.has(id)) continue
      const d = dist.get(id) ?? Infinity
      if (d < bestD) {
        bestD = d
        best = id
      }
    }
    if (best === null || bestD === Infinity) break
    if (best === target) break
    used.add(best)
    for (const edge of adj.get(best) ?? []) {
      const cost = bestD + 1 / Math.max(edge.w, 0.01)
      if (cost < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, cost)
        prev.set(edge.to, best)
      }
    }
  }

  if (!prev.has(target) && source !== target) return null
  const path = [target]
  let cur = target
  while (cur !== source) {
    const p = prev.get(cur)
    if (!p) return null
    path.push(p)
    cur = p
  }
  path.reverse()
  return path
}

export function pathWeight(links: MemoryLink[], path: string[]): number {
  let sum = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const hit = links.find(
      (l) => (l.source === a && l.target === b) || (l.source === b && l.target === a),
    )
    if (hit) sum += hit.weight
  }
  return sum
}
