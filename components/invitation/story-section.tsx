import { wedding } from '@/config/wedding'
import { Reveal } from './reveal'

export function StorySection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="eyebrow">Our story</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">How it began</h2>
        </Reveal>
        <ol className="relative mt-14 flex flex-col gap-12 border-l border-gold/50 pl-8 sm:pl-12">
          {wedding.story.map((item, index) => (
            <li key={item.year}>
              <Reveal delay={index * 80}>
                <span
                  aria-hidden
                  className="absolute -left-[0.4rem] mt-2 size-3 rounded-full border-2 border-background bg-gold"
                />
                <p className="font-display text-xl italic text-gold">{item.year}</p>
                <h3 className="font-display mt-1 text-2xl">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{item.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
