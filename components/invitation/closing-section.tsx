import Image from 'next/image'
import { AtSign } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { Reveal } from './reveal'

export function ClosingSection() {
  return (
    <footer className="relative overflow-hidden bg-secondary/60 px-6 py-28 text-center">
      <Image
        src="/images/floral.png"
        alt=""
        width={700}
        height={380}
        aria-hidden
        loading='eager'
        className="pointer-events-none absolute -left-20 -top-6 z-0 w-[24rem] max-w-none opacity-80 mix-blend-multiply"
      />
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6">
        <Reveal>
          <p className="leading-relaxed text-muted-foreground text-pretty">{wedding.closing.message}</p>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{wedding.closing.signoff}</p>
          <p className="font-display mt-3 text-5xl">{wedding.closing.names}</p>
          <p className="mt-3 text-sm text-muted-foreground">{wedding.closing.family}</p>
        </Reveal>
        <Reveal delay={200}>
          <ul className="flex flex-wrap justify-center gap-5">
            {wedding.social.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <AtSign className="size-4" aria-hidden />
                  {link.label}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className='text-center text-sm text-muted-foreground mt-9'>Made by: <br />Ince Ahmad Muhadi U.</p>
        </Reveal>
      </div>
    </footer>
  )
}
