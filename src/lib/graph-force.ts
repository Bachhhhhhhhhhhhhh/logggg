import type { Category } from '../types'

interface SimNode {
  category: Category
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
}

export function clusterForce(strength = 0.06) {
  let nodes: SimNode[] = []

  function force(alpha: number) {
    const centroids: Record<string, { x: number; y: number; z: number; n: number }> =
      {}
    for (const node of nodes) {
      const key = node.category
      if (!centroids[key]) centroids[key] = { x: 0, y: 0, z: 0, n: 0 }
      const c = centroids[key]
      c.x += node.x ?? 0
      c.y += node.y ?? 0
      c.z += node.z ?? 0
      c.n += 1
    }
    for (const c of Object.values(centroids)) {
      if (!c.n) continue
      c.x /= c.n
      c.y /= c.n
      c.z /= c.n
    }
    const k = strength * alpha
    for (const node of nodes) {
      const c = centroids[node.category]
      if (!c) continue
      node.vx = (node.vx ?? 0) + (c.x - (node.x ?? 0)) * k
      node.vy = (node.vy ?? 0) + (c.y - (node.y ?? 0)) * k
      if (node.z !== undefined) {
        node.vz = (node.vz ?? 0) + (c.z - node.z) * k
      }
    }
  }

  force.initialize = (next: SimNode[]) => {
    nodes = next
  }

  return force
}
