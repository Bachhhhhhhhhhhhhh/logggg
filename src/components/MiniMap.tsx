import { categoryColor } from '../lib/categories'
import type { MemoryNode } from '../types'

export interface MiniPos {
  id: string
  x: number
  y: number
  z: number
  category: MemoryNode['category']
}

export function MiniMap({
  positions,
  selectedIds,
}: {
  positions: MiniPos[]
  selectedIds: string[]
}) {
  if (positions.length === 0) return null
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const p of positions) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minZ = Math.min(minZ, p.z)
    maxZ = Math.max(maxZ, p.z)
  }
  const w = 132
  const h = 88
  const pad = 8
  const sx = (maxX - minX) || 1
  const sz = (maxZ - minZ) || 1

  return (
    <div className="glass-dark overflow-hidden rounded-xl">
      <div className="px-2 pt-1.5 font-mono text-[9px] tracking-[0.18em] text-faint uppercase">
        Field
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        {positions.map((p) => {
          const x = pad + ((p.x - minX) / sx) * (w - pad * 2)
          const y = pad + ((p.z - minZ) / sz) * (h - pad * 2)
          const on = selectedIds.includes(p.id)
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={on ? 2.4 : 1.2}
              fill={on ? '#f3ddb0' : categoryColor(p.category)}
              opacity={on ? 1 : 0.7}
            />
          )
        })}
      </svg>
    </div>
  )
}
