'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { maxRsvpNoteLength } from '@/config/wedding'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'

export type InviteState = 'valid' | 'invalid' | 'none'

type Rsvp = {
  attendanceStatus: 'attending' | 'declined'
  guestCount: number
  message: string | null
}

type RsvpSectionProps = {
  inviteState: InviteState
  token: string | null
  guest: { name: string; partySizeLimit: number } | null
  initialRsvp: Rsvp | null
}

export function RsvpSection({ inviteState, token, guest, initialRsvp }: RsvpSectionProps) {
  return (
    <section id="rsvp" className="bg-secondary/60 px-6 py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
        <Reveal>
          <p className="eyebrow">RSVP</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Will you join us?</h2>
        </Reveal>

        <Reveal delay={100} className="w-full">
          {inviteState === 'valid' && guest && token ? (
            <RsvpForm token={token} guest={guest} initialRsvp={initialRsvp} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-sm leading-relaxed text-muted-foreground shadow-sm">
              {inviteState === 'invalid' ? (
                <p>
                  Tautan undangan ini tidak valid atau sudah tidak aktif. Silakan hubungi pasangan tersebut untuk mendapatkan tautan baru.
                  tautan pribadi.
                </p>
              ) : (
                <p>
                  Konfirmasi kehadiran (RSVP) dapat dilakukan melalui tautan undangan pribadi Anda. Silakan buka tautan yang dikirimkan pasangan 
                  pengantin untuk mengkonfirmasi kehadiran Anda.
                </p>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

function RsvpForm({
  token,
  guest,
  initialRsvp,
}: {
  token: string
  guest: { name: string; partySizeLimit: number }
  initialRsvp: Rsvp | null
}) {
  const [status, setStatus] = useState<'attending' | 'declined' | null>(initialRsvp?.attendanceStatus ?? null)
  const [count, setCount] = useState(initialRsvp?.attendanceStatus === 'attending' ? initialRsvp.guestCount : 1)
  const [message, setMessage] = useState(initialRsvp?.message ?? '')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<Rsvp | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!status) {
      setError('Please choose whether you can attend.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          attendance_status: status,
          guest_count: status === 'attending' ? count : 0,
          message: message.trim() || null,
          website,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSaved({
        attendanceStatus: status,
        guestCount: status === 'attending' ? count : 0,
        message: message.trim() || null,
      })
    } catch {
      setError('We could not reach the server. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (saved) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="font-display text-2xl">
          {saved.attendanceStatus === 'attending' ? 'Terima kasih, kami akan menemui Anda di sana' : 'Terima kasih telah memberi tahu kami'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {saved.attendanceStatus === 'attending'
            ? `Kami menyimpan RSVP anda untuk ${saved.guestCount} ${saved.guestCount === 1 ? 'guest' : 'guests'}.`
            : 'Anda akan dirindukan, dan kami berterima kasih atas doa-doa Anda..'}
        </p>
        <Button variant="outline" className="mt-2 rounded-full" onClick={() => setSaved(null)}>
          Ubah response saya
        </Button>
      </div>
    )
  }

  const options = Array.from({ length: guest.partySizeLimit }, (_, i) => i + 1)

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-left shadow-sm sm:p-8"
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Invitation for</p>
        <p className="font-display mt-1 text-3xl">{guest.name}</p>
        {initialRsvp && (
          <p className="mt-2 text-sm text-primary">Anda telah selesai merespons. Anda dapat memperbarui jawaban Anda di bawah.</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Akan Anda hadir?</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: 'attending', label: 'Hadir dengan senang hati' },
              { value: 'declined', label: 'Menyesalkan harus menolak' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-4 text-center text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring',
                status === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent',
              )}
            >
              <input
                type="radio"
                name="attendance"
                value={option.value}
                checked={status === option.value}
                onChange={() => setStatus(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === 'attending' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-count">Jumlah tamu yang akan hadir</Label>
          <select
            id="guest-count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Undangan Anda mengizinkan hingga {guest.partySizeLimit} {guest.partySizeLimit === 1 ? 'tamu' : 'tamu'}.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="rsvp-message">Catatan untuk pasangan (opsional)</Label>
        <Textarea
          id="rsvp-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={maxRsvpNoteLength}
          rows={3}
          placeholder="Dietary needs, a kind word, anything we should know"
        />
        <p className="text-right text-xs text-muted-foreground">
          {message.length}/{maxRsvpNoteLength}
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

      <Button type="submit" size="lg" disabled={submitting} className="rounded-full">
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {initialRsvp ? 'Perbarui RSVP' : 'Kirim RSVP'}
      </Button>
    </form>
  )
}
