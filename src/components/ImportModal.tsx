import { useRef, useState } from 'react'
import { useMemoryStore } from '../store'

export function ImportModal() {
  const open = useMemoryStore((s) => s.importOpen)
  const error = useMemoryStore((s) => s.importError)
  const setImportOpen = useMemoryStore((s) => s.setImportOpen)
  const importSnapshot = useMemoryStore((s) => s.importSnapshot)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  if (!open) return null

  function ingestFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        importSnapshot(parsed)
      } catch {
        importSnapshot(null)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close import"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setImportOpen(false)}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-accent/20 bg-panel p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.22em] text-accent uppercase">Snapshot</div>
            <h2 className="font-display text-[26px] leading-none text-ink">Import</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              JSON with <code className="font-mono text-accent">nodes</code> and{' '}
              <code className="font-mono text-accent">links</code>. Optional knowledge,
              communities, jobs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImportOpen(false)}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) ingestFile(file)
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition ${
            dragging ? 'border-accent bg-accent/10' : 'border-line-strong bg-canvas'
          }`}
        >
          <span className="text-[13px] font-medium text-ink">Drop a .json snapshot</span>
          <span className="mt-1 text-[12px] text-muted">or click to browse</span>
          <span className="mt-3 font-mono text-[11px] text-faint">/sample-snapshot.json</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) ingestFile(file)
            }}
          />
        </label>

        {error && <p className="mt-3 text-[12.5px] text-issues">{error}</p>}
      </div>
    </div>
  )
}
