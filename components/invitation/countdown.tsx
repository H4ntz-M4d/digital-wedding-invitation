'use client'

import { useEffect, useState } from 'react'
import { splitCountdown } from '@/lib/format'

export function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const targetTime = new Date(target).getTime()
    const tick = () => setRemaining(targetTime - Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [target])

  if (remaining !== null && remaining <= 0) {
    return <p className="font-display text-2xl italic">The celebration has begun.</p>
  }

  const parts = splitCountdown(remaining ?? 0)
  const items = [
    { label: 'Days', value: parts.days },
    { label: 'Hours', value: parts.hours },
    { label: 'Minutes', value: parts.minutes },
    { label: 'Seconds', value: parts.seconds },
  ]

  return (
    <div role="timer" aria-label="Countdown to the wedding" className="flex items-stretch justify-center gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex w-[4.5rem] flex-col items-center rounded-xl border border-border bg-card px-2 py-4 shadow-sm sm:w-24"
        >
          <span className="font-display text-3xl tabular-nums sm:text-4xl">
            {remaining === null ? '--' : String(item.value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
