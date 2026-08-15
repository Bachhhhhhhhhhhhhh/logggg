import { useMemoryStore } from '../store'

export function ToastHost() {
  const toasts = useMemoryStore((s) => s.toasts)
  const dismissToast = useMemoryStore((s) => s.dismissToast)
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed right-3 bottom-20 z-[70] flex w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-2 md:right-4 md:bottom-10">
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
