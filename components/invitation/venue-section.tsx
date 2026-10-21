import { Navigation } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { buttonVariants } from '@/components/ui/button'
import { Reveal } from './reveal'

export function VenueSection() {
  return (
    <section className="bg-secondary/60 px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <Reveal>
          <p className="eyebrow">Location</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">{wedding.venue.name}</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground text-pretty">{wedding.venue.address}</p>
        </Reveal>
        <Reveal delay={100} className="w-full">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              title={`Map showing ${wedding.venue.name}`}
              src={wedding.venue.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0"
            />
          </div>
        </Reveal>
        <Reveal delay={200}>
          <a
            href={wedding.venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: 'lg', className: 'rounded-full px-8' })}
          >
            <Navigation className="size-4" aria-hidden />
            Petunjuk Arah
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
