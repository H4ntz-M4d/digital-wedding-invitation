'use client'

import Image from 'next/image'
import { useState } from 'react'
import { wedding } from '@/config/wedding'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Reveal } from './reveal'
import { cn } from '@/lib/utils'

export function GallerySection() {
  const [active, setActive] = useState<number | null>(null)
  const current = active === null ? null : wedding.gallery[active]

  return (
    <section className="bg-secondary/60 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="eyebrow">Gallery</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Moments we cherish</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4">
          {wedding.gallery.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 100}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Open photo: ${photo.alt}`}
                className={cn(
                  'group relative block w-full overflow-hidden rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-ring',
                  photo.ratio === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]',
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 896px) 440px, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none sm:max-w-3xl">
          <DialogTitle className="sr-only">Photo gallery</DialogTitle>
          <DialogDescription className="sr-only">{current?.alt}</DialogDescription>
          {current && (
            <Image
              src={current.src}
              alt={current.alt}
              width={1200}
              height={1200}
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
