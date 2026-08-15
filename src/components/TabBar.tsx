import { useMemoryStore } from '../store'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'communities', label: 'Communities' },
  { id: 'graph', label: 'Graph' },
  { id: 'devwork', label: 'Dev work' },
  { id: 'jobs', label: 'Jobs' },
]

export function TabBar() {
  const tab = useMemoryStore((s) => s.tab)
  const setTab = useMemoryStore((s) => s.setTab)

  return (
    <nav className="flex items-end gap-1 border-b border-line px-6" aria-label="Memory sections">
      {TABS.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`relative -mb-px px-3 py-2.5 text-[13px] transition ${
              active
                ? 'font-semibold text-ink'
                : 'font-medium text-muted hover:text-ink'
            }`}
          >
            {item.label}
            <span
              className={`absolute inset-x-2 bottom-0 h-[2px] rounded-full transition ${
                active ? 'bg-ink' : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}
