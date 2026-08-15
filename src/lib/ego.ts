import type { MemoryLink, MemoryNode } from '../types'

export function egoNetwork(
  links: MemoryLink[],
  seeds: string[],
  hops: number,
): Set<string> {
  const all = new Set(seeds)
  let front = new Set(seeds)
  for (let i = 0; i < hops; i++) {
    const next = new Set<string>()
    for (const link of links) {
      if (front.has(link.source) && !all.has(link.target)) next.add(link.target)
      if (front.has(link.target) && !all.has(link.source)) next.add(link.source)
    }
    for (const id of next) all.add(id)
    front = next
    if (!front.size) break
  }
  return all
}

export function bridgeScores(nodes: MemoryNode[], links: MemoryLink[]) {
  const comm = new Map(nodes.map((n) => [n.id, n.communityId]))
  const score = new Map<string, number>()
  for (const n of nodes) score.set(n.id, 0)
  for (const link of links) {
    const a = comm.get(link.source)
    const b = comm.get(link.target)
    if (!a || !b || a === b) continue
    score.set(link.source, (score.get(link.source) ?? 0) + link.weight)
    score.set(link.target, (score.get(link.target) ?? 0) + link.weight)
  }
  return [...score.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([id, value]) => ({ id, value }))
}

export function recommendNeighbors(
  links: MemoryLink[],
  id: string,
  exclude: Set<string>,
  limit = 5,
) {
  const rows: { id: string; weight: number }[] = []
  for (const link of links) {
    const other = link.source === id ? link.target : link.target === id ? link.source : null
    if (!other || exclude.has(other)) continue
    rows.push({ id: other, weight: link.weight })
  }
  rows.sort((a, b) => b.weight - a.weight)
  return rows.slice(0, limit)
}
