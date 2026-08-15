import type { ReactNode } from 'react'
import { useMemoryStore } from '../store'

export function SettingsPanel() {
  const open = useMemoryStore((s) => s.settingsOpen)
  const setSettingsOpen = useMemoryStore((s) => s.setSettingsOpen)
  const hopDepth = useMemoryStore((s) => s.hopDepth)
  const setHopDepth = useMemoryStore((s) => s.setHopDepth)
  const particles = useMemoryStore((s) => s.particles)
  const setParticles = useMemoryStore((s) => s.setParticles)
  const autoRotate = useMemoryStore((s) => s.autoRotate)
  const setAutoRotate = useMemoryStore((s) => s.setAutoRotate)
  const minLinkWeight = useMemoryStore((s) => s.minLinkWeight)
  const setMinLinkWeight = useMemoryStore((s) => s.setMinLinkWeight)
  const live = useMemoryStore((s) => s.live)
  const setLive = useMemoryStore((s) => s.setLive)
  const liveSpeed = useMemoryStore((s) => s.liveSpeed)
  const setLiveSpeed = useMemoryStore((s) => s.setLiveSpeed)
  const followLive = useMemoryStore((s) => s.followLive)
  const setFollowLive = useMemoryStore((s) => s.setFollowLive)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        aria-label="Close settings"
        onClick={() => setSettingsOpen(false)}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-accent/20 bg-panel p-5">
        <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Console</div>
        <h2 className="font-display mt-1 text-[28px] leading-none">Settings</h2>
        <div className="mt-5 space-y-4 text-[13px]">
          <Row label={`Ego hops · ${hopDepth}`}>
            <input
              type="range"
              min={1}
              max={3}
              value={hopDepth}
              onChange={(e) => setHopDepth(Number(e.target.value))}
              className="w-40"
            />
          </Row>
          <Row label={`Link weight ≥ ${minLinkWeight}`}>
            <input
              type="range"
              min={1}
              max={80}
              value={minLinkWeight}
              onChange={(e) => setMinLinkWeight(Number(e.target.value))}
              className="w-40"
            />
          </Row>
          <Row label="Edge particles">
            <Toggle on={particles} onClick={() => setParticles(!particles)} />
          </Row>
          <Row label="Auto orbit">
            <Toggle on={autoRotate} onClick={() => setAutoRotate(!autoRotate)} />
          </Row>
          <Row label="Realtime stream">
            <Toggle on={live} onClick={() => setLive(!live)} />
          </Row>
          <Row label={`Stream speed · ${liveSpeed}x`}>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={liveSpeed}
              onChange={(e) => setLiveSpeed(Number(e.target.value))}
              className="w-40"
            />
          </Row>
          <Row label="Follow live node">
            <Toggle on={followLive} onClick={() => setFollowLive(!followLive)} />
          </Row>
        </div>
        <p className="mt-4 text-[11.5px] text-muted">
          Pins, notes and these sliders persist in this browser.
        </p>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 w-10 rounded-full border ${
        on ? 'border-accent bg-accent/30' : 'border-line bg-canvas'
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full transition ${
          on ? 'translate-x-5 bg-accent' : 'translate-x-1 bg-muted'
        }`}
      />
    </button>
  )
}
