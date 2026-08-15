import { useMemoryStore } from '../store'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'graph', label: 'Graph', icon: 'M4 12h16M12 4v16M7 7l10 10M17 7L7 17' },
  { id: 'knowledge', label: 'Know', icon: 'M6 5h12v14H6zM9 9h6M9 13h6' },
  { id: 'communities', label: 'Clusters', icon: 'M8 12a3 3 0 116 0 3 3 0 01-6 0zM4 18a5 5 0 0116 0' },
  { id: 'devwork', label: 'Dev', icon: 'M8 8l-4 4 4 4M16 8l4 4-4 4' },
  { id: 'jobs', label: 'Jobs', icon: 'M5 7h14v10H5zM8 7V5h8v2' },
]

export function BottomNav() {
  const tab = useMemoryStore((s) => s.tab)
  const setTab = useMemoryStore((s) => s.setTab)

  return (
    <nav
      className="z-30 grid shrink-0 grid-cols-5 border-t border-line bg-panel/95 pt-1 md:hidden"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      aria-label="Memory sections"
    >
      {TABS.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 ${
              active ? 'text-accent' : 'text-faint'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d={item.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="text-[10px]">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
