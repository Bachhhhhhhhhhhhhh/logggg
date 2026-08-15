import { categoryColor } from './categories'
import { COMMUNITY_PALETTE, heatHex, weekHeat } from './metrics'
import type { MemoryNode, VizMode } from '../types'

const communityIndex = new Map<string, number>()

export function communityColor(communityId: string): string {
  if (!communityIndex.has(communityId)) {
    communityIndex.set(communityId, communityIndex.size % COMMUNITY_PALETTE.length)
  }
  return COMMUNITY_PALETTE[communityIndex.get(communityId) ?? 0]
}

export function nodeLookColor(
  node: MemoryNode,
  viz: VizMode,
  week: number,
  path: Set<string> | null,
  visible: Set<string> | null,
): string {
  if (visible && !visible.has(node.id)) return '#141820'
  if (path?.has(node.id)) return '#f3ddb0'
  if (viz === 'heat') return heatHex(weekHeat(node, week))
  if (viz === 'community') return communityColor(node.communityId)
  return categoryColor(node.category)
}
