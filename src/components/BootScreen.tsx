import { useEffect, useState } from 'react'

export function BootScreen() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 1750)
    return () => window.clearTimeout(t)
  }, [])

  if (gone) return null

  return (
    <div
      className="boot-fade fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center bg-[#03040a]"
      onClick={() => setGone(true)}
      role="presentation"
    >
      <div className="noise absolute inset-0" />
      <div className="mb-5 h-px w-40 gold-line" />
      <div className="font-display gold-text text-5xl tracking-[0.22em]">Memory</div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.38em] text-faint uppercase">
        Initializing retrieval graph
      </div>
      <div className="mt-8 h-px w-24 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/2 animate-pulse bg-accent" />
      </div>
    </div>
  )
}
