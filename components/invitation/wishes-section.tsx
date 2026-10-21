'use client'

import { useState } from 'react'
import { Loader2, MessageCircleHeart } from 'lucide-react'
import { maxWishLength } from '@/config/wedding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatShortDateTime } from '@/lib/format'
import { Reveal } from './reveal'

type Wish = { id: string; guestName: string; message: string; createdAt: string }

type WishesSectionProps = {
  wishes: Wish[]
  token: string | null
  guestName: string | null
}

export function WishesSection({ wishes, token, guestName }: WishesSectionProps) {
  const [name, setName] = useState(guestName ?? '')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token ?? undefined, guest_name: name, message, website }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
      setMessage('')
    } catch {
      setError('We could not reach the server. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10">
        <Reveal className="text-center">
          <p className="eyebrow">Wishes</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Words of love</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground text-pretty">
            Tuliskan harapan atau doa untuk pasangan tersebut. Harapan akan muncul setelah disetujui oleh pasangan itu.
          </p>
        </Reveal>

        <Reveal className="w-full">
          {sent ? (
            <div role="status" className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <MessageCircleHeart className="mx-auto size-8 text-primary" aria-hidden />
              <p className="font-display mt-3 text-2xl">Terima kasih atas kata-kata baik Anda</p>
              <p className="mt-1 text-sm text-muted-foreground">Permintaan Anda sedang menunggu persetujuan dan akan segera muncul.</p>
              <Button variant="outline" className="mt-5 rounded-full" onClick={() => setSent(false)}>
                Tuliskan harapan lain
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="wish-name">Nama Anda</Label>
                <Input
                  id="wish-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wish-message">Tulis Ucapan & doa restu</Label>
                <Textarea
                  id="wish-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={maxWishLength}
                  rows={4}
                  required
                />
                <p className="text-right text-xs text-muted-foreground">
                  {message.length}/{maxWishLength}
                </p>
              </div>
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>
              {error && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="rounded-full" size="lg">
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Kirim Ucapan
              </Button>
            </form>
          )}
        </Reveal>

        <div className="w-full">
          {wishes.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Ucapan yang disetujui akan muncul di sini. Jadilah orang pertama yang memberikan ucapan.
            </p>
          ) : (
            <ul className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1" aria-label="Wishes for the couple">
              {wishes.map((wish) => (
                <li key={wish.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <p className="leading-relaxed text-pretty">{wish.message}</p>
                  <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{wish.guestName}</span>
                    <time dateTime={wish.createdAt}>{formatShortDateTime(wish.createdAt)}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
