import { useMemoryStore } from '../store'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'graph', label: 'Graph', icon: 'M4 12h16M12 4v16M7 7l10 10M17 7L7 17' },
  { id: 'knowledge', label: 'Knowledge', icon: 'M6 5h12v14H6zM9 9h6M9 13h6' },
  { id: 'communities', label: 'Communities', icon: 'M8 12a3 3 0 116 0 3 3 0 01-6 0zM4 18a5 5 0 0116 0' },
  { id: 'devwork', label: 'Dev work', icon: 'M8 8l-4 4 4 4M16 8l4 4-4 4' },
  { id: 'jobs', label: 'Jobs', icon: 'M5 7h14v10H5zM8 7V5h8v2' },
]

export function IconRail() {
  const tab = useMemoryStore((s) => s.tab)
  const setTab = useMemoryStore((s) => s.setTab)

  return (
    <nav
      className="flex w-[68px] shrink-0 flex-col items-center gap-1 border-r border-line bg-panel/90 py-3"
      aria-label="Memory sections"
    >
      {TABS.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => setTab(item.id)}
            className={`group relative flex h-12 w-12 flex-col items-center justify-center rounded-xl transition ${
              active
                ? 'bg-accent/15 text-accent shadow-[0_0_20px_rgba(212,175,120,0.12)]'
                : 'text-faint hover:bg-white/5 hover:text-ink'
            }`}
          >
            {active && (
              <span className="absolute left-0 h-6 w-0.5 rounded-r bg-accent" />
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d={item.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="mt-1 text-[8.5px] tracking-wide uppercase">{item.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </nav>
  )
}
