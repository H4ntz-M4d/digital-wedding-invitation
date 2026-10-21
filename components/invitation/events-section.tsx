import { CalendarPlus, Clock, MapPin } from 'lucide-react'
import { wedding, weddingStart } from '@/config/wedding'
import { buttonVariants } from '@/components/ui/button'
import { formatEventDate, googleCalendarUrl } from '@/lib/format'
import { Countdown } from './countdown'
import { Reveal } from './reveal'

export function EventsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12">
        <Reveal className="text-center">
          <p className="eyebrow">The celebration</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Wedding schedule</h2>
        </Reveal>

        <Reveal delay={100}>
          <Countdown target={weddingStart.toISOString()} />
        </Reveal>

        <div className="grid w-full gap-6 md:grid-cols-2">
          {wedding.events.map((event, index) => (
            <Reveal key={event.id} delay={index * 150}>
              <article className="flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <h3 className="font-display text-3xl">{event.title}</h3>
                <p className="text-sm uppercase tracking-[0.2em] text-gold">{formatEventDate(event.start)}</p>
                <p className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-primary" aria-hidden />
                  {event.timeLabel}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {wedding.venue.name}
                </p>
                <a
                  href={googleCalendarUrl({
                    title: `${event.title}: ${wedding.groom.nickname} & ${wedding.bride.nickname}`,
                    start: event.start,
                    location: `${wedding.venue.name}, ${wedding.venue.address}`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-auto rounded-full' })}
                >
                  <CalendarPlus className="size-4" aria-hidden />
                  Tambahkan ke Kalender
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
