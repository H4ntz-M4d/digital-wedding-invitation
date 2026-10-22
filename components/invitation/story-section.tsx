import { wedding } from "@/config/wedding";
import { Reveal } from "./reveal";

export function StorySection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="eyebrow">Our Journey</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">
            How it began
          </h2>
        </Reveal>
        <ol className="relative mt-14 flex flex-col gap-12 border-l border-gold/50 pl-8 sm:pl-12">
          {wedding.story.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={index * 80}>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full border-2 border-background bg-gold" />
                  <h3 className="font-display mt-1 text-2xl">{item.title}</h3>
                </div>
                <p className="mt-2  leading-relaxed text-muted-foreground text-pretty">
                  {item.text}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground text-pretty text-center mt-18">Semua ini terjadi dengan izin<br /> <span className="text-gold">Allah SWT</span></p>
      </div>
    </section>
  );
}
