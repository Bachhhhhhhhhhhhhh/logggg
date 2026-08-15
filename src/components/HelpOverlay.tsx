import { useMemoryStore } from '../store'

const ROWS = [
  ['⌘K', 'Command search'],
  ['F', 'Cinematic fullscreen'],
  ['Space', 'Play 16-week memory'],
  ['1 / 2 / 3', 'Field · Heat · Cluster'],
  ['[ / ]', 'Ego hops 1–3'],
  ['B', 'Pin selected node'],
  ['A', 'Open atlas'],
  ['T', 'Tour hubs'],
  [',', 'Settings'],
  ['L', 'Pause / resume live stream'],
  ['P', 'Path panel'],
  ['R', 'Refit camera'],
  ['Shift+click', 'Add node / build a path'],
  ['Double-click', 'Open inspector'],
  ['?', 'This legend'],
  ['Esc', 'Clear / exit'],
]

export function HelpOverlay() {
  const open = useMemoryStore((s) => s.helpOpen)
  const setHelpOpen = useMemoryStore((s) => s.setHelpOpen)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close help"
        onClick={() => setHelpOpen(false)}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-accent/20 bg-panel p-5 shadow-2xl">
        <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Conductor</div>
        <h2 className="font-display mt-1 text-[28px] leading-none">Shortcuts</h2>
        <ul className="mt-4 max-h-[60vh] divide-y divide-line overflow-auto scrollbar-thin">
          {ROWS.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-2 text-[13px]">
              <span className="text-muted">{v}</span>
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-accent">
                {k}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
