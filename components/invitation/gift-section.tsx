'use client'

import { useState } from 'react'
import { Check, Copy, Gift } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} className="rounded-full" aria-label={label}>
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  )
}

export function GiftSection() {
  const gift = wedding.gift
  if (!gift) return null

  return (
    <section className="px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
        <Reveal>
          <Gift className="mx-auto size-8 text-gold" aria-hidden />
          <p className="eyebrow mt-4">Wedding gift</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">With gratitude</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-pretty">{gift.message}</p>
        </Reveal>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          {gift.accounts.map((account, index) => (
            <Reveal key={account.number} delay={index * 120}>
              <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{account.bank}</p>
                <p className="font-display text-3xl tabular-nums tracking-wide">{account.number}</p>
                <p className="mb-2 text-sm text-muted-foreground">a.n. {account.holder}</p>
                <CopyButton value={account.number} label={`Copy ${account.bank} account number`} />
              </div>
            </Reveal>
          ))}
        </div>

        {gift.address && (
          <Reveal>
            <p className="text-sm text-muted-foreground">
              Gift delivery address
              <span className="mt-1 block text-foreground">{gift.address}</span>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
