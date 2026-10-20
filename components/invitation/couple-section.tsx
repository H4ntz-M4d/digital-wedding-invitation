import Image from 'next/image'
import { AtSign } from 'lucide-react'
import { wedding, type Person } from '@/config/wedding'
import { Reveal } from './reveal'

function PersonCard({ person, delay }: { person: Person; delay: number }) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center text-center">
      <div className="relative aspect-[4/5] w-64 overflow-hidden rounded-t-[8rem] rounded-b-2xl border-4 border-card shadow-xl ring-1 ring-border">
        <Image
          src={person.photo}
          alt={`Portrait of ${person.fullName}`}
          fill
          sizes="256px"
          className="object-cover"
        />
      </div>
      <p className="eyebrow mt-8">{person.title}</p>
      <h3 className="font-display mt-2 text-3xl text-balance">{person.fullName}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{person.parents}</p>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty">{person.bio}</p>
      {person.instagram && (
        <a
          href={person.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
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
        <div className="flex flex-col items-center gap-16 md:flex-row md:items-start md:justify-center md:gap-20">
          <PersonCard person={wedding.groom} delay={0} />
          <span className="font-display hidden text-6xl italic text-gold md:block md:self-center" aria-hidden>
            &amp;
          </span>
          <PersonCard person={wedding.bride} delay={150} />
        </div>
      </div>
    </section>
  )
}
