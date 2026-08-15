import type { LabelMode, VizMode } from '../types'

export const PREFS_KEY = 'memory.prefs.v1'

export interface Prefs {
  bookmarks: string[]
  notes: Record<string, string>
  hopDepth: number
  minLinkWeight: number
  vizMode: VizMode
  labelMode: LabelMode
  autoRotate: boolean
  particles: boolean
  graphMode: '2d' | '3d'
}

export function loadPrefs(): Partial<Prefs> {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Prefs>
  } catch {
    return {}
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* ignore quota */
  }
}

export function downloadText(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
