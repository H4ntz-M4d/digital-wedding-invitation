import Image from 'next/image'
import { AtSign } from 'lucide-react'
import { wedding, type Person } from '@/config/wedding'
import { Reveal } from './reveal'

function PersonCard({ person, delay }: { person: Person; delay: number }) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center text-center">
      <p className="eyebrow mt-8">{person.title}</p>
      <h3 className="font-display mt-2 text-3xl text-balance">{person.fullName}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{person.parents}</p>
      {person.instagram && (
        <a
          href={person.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
        >
          <AtSign className="size-4" aria-hidden />
          Instagram
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </Reveal>
  )
}

export function CoupleSection() {
  return (
    <section className="bg-secondary/60 px-6 py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-14">
        <Reveal className="text-center">
          <p className="eyebrow">The couple</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Two hearts, one journey</h2>
        </Reveal>
        <div className="flex flex-col items-center gap-8 md:items-center md:justify-center">
          <PersonCard person={wedding.groom} delay={0} />
          <span className="font-display text-6xl italic text-gold md:block md:self-center" aria-hidden>
            &amp;
          </span>
          <PersonCard person={wedding.bride} delay={150} />
        </div>
      </div>
    </section>
  )
}
