import Image from "next/image";
import { wedding } from "@/config/wedding";
import { formatEventDate } from "@/lib/format";
import { Reveal } from "./reveal";

export function OpeningSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center">
      <Image
        src="/images/floral.png"
        alt=""
        width={700}
        height={380}
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-10 z-0 w-[26rem] max-w-none opacity-90 mix-blend-multiply animate-[float-slow_9s_ease-in-out_infinite] motion-reduce:animate-none sm:w-[34rem]"
      />
      <Image
        src="/images/floral.png"
        alt=""
        width={700}
        height={380}
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 z-0 w-[26rem] max-w-none rotate-180 opacity-90 mix-blend-multiply sm:w-[34rem]"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-8">
        <Reveal>
          <p className="eyebrow">Save the date</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-5xl text-balance sm:text-7xl">
            {wedding.groom.nickname}{" "}
            <span className="italic text-gold">&amp;</span>{" "}
            {wedding.bride.nickname}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
            {formatEventDate(wedding.events[0].start)}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <Image height={300} width={300} src={"/images/wedding-people-art.png"} alt="Wedding People Art" />
        </Reveal>
        
        <Reveal delay={400}>
          <blockquote className="max-w-xl">
            <p className="font-display text-xl italic leading-relaxed text-pretty sm:text-2xl">
              &ldquo;{wedding.opening.verse}&rdquo;
            </p>
            <footer className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {wedding.opening.verseSource}
            </footer>
          </blockquote>
        </Reveal>
        <Reveal delay={500}>
          <p className="max-w-lg leading-relaxed text-muted-foreground text-pretty">
            {wedding.opening.message}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
