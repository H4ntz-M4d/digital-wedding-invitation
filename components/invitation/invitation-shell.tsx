'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { wedding } from '@/config/wedding'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type InvitationShellProps = {
  guestName: string | null
  children: React.ReactNode
}

export function InvitationShell({ guestName, children }: InvitationShellProps) {
  const [opened, setOpened] = useState(false)
  const [coverGone, setCoverGone] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioUnavailable, setAudioUnavailable] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const root = document.documentElement
    root.style.overflow = opened ? '' : 'hidden'
    return () => {
      root.style.overflow = ''
    }
  }, [opened])

  useEffect(() => {
    if (!opened) return
    const timer = window.setTimeout(() => setCoverGone(true), 1100)
    return () => window.clearTimeout(timer)
  }, [opened])

  const openInvitation = useCallback(() => {
    setOpened(true)
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.5
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      audio.pause()
      setPlaying(false)
    }
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        src={wedding.music.src}
        loop
        preload="none"
        onError={() => setAudioUnavailable(true)}
      />

      {!coverGone && (
        <div
          role="dialog"
          aria-label="Invitation cover"
          aria-hidden={opened}
          inert={opened}
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden text-white transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]',
            opened && '-translate-y-full',
          )}
        >
          <Image
            src={wedding.cover.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          <div className="relative flex w-full max-w-md flex-col items-center gap-5 px-6 pb-14 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/80">{wedding.cover.eyebrow}</p>
            <h1 className="font-display text-5xl leading-tight text-balance sm:text-6xl">
              {wedding.groom.nickname}
              <span className="mx-3 text-3xl italic text-white/70">&amp;</span>
              {wedding.bride.nickname}
            </h1>
            <div className="mt-2 flex flex-col items-center gap-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Dear</p>
              <p className="font-display text-2xl text-balance">{guestName ?? 'Honored Guest'}</p>
              <p className="mt-1 text-xs text-white/70">
                You are warmly invited to celebrate with us.
              </p>
            </div>
            <Button
              onClick={openInvitation}
              size="lg"
              className="mt-3 rounded-full bg-white px-8 text-foreground hover:bg-white/90"
            >
              {wedding.cover.openLabel}
            </Button>
          </div>
        </div>
      )}

      {children}

      {opened && !audioUnavailable && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? 'Pause background music' : 'Play background music'}
          aria-pressed={playing}
          className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full border border-border bg-card/90 text-primary shadow-lg backdrop-blur transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-ring"
        >
          {playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      )}
    </>
  )
}
