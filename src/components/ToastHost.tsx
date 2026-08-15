import { useMemoryStore } from '../store'

export function ToastHost() {
  const toasts = useMemoryStore((s) => s.toasts)
  const dismissToast = useMemoryStore((s) => s.dismissToast)
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed right-4 bottom-10 z-[70] flex w-72 flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className="pointer-events-auto rise glass-dark rounded-xl px-3 py-2 text-left text-[12.5px] text-ink"
        >
          {t.text}
        </button>
      ))}
    </div>
  )
}
