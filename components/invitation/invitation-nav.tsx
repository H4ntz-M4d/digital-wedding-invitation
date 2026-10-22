'use client'

import { useEffect, useState } from 'react'
import { Home, Users, CalendarDays, Gift, CheckCircle2 } from 'lucide-react'
import { useInvitationOpened } from './invitation-shell'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Couple', href: '#couple', icon: Users },
  { label: 'Event', href: '#events', icon: CalendarDays },
  { label: 'Gift', href: '#gift', icon: Gift },
  { label: 'RSVP', href: '#rsvp', icon: CheckCircle2 },
]

export function InvitationNav() {
  const opened = useInvitationOpened()
  const [activeId, setActiveId] = useState<string>('home')

  useEffect(() => {
    if (!opened) return

    const sectionIds = links.map((link) => link.href.slice(1))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Ambil section yang paling besar porsi kemunculannya di viewport
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        // Fokus ke area tengah layar, dikurangi tinggi navbar di bawah
        rootMargin: '-40% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [opened])

  return (
    <nav
      aria-label="Invitation navigation"
      aria-hidden={!opened}
      inert={!opened}
      className={cn(
        'fixed bottom-2 left-0 right-0 z-40 mx-10 rounded-2xl border-t bg-secondary backdrop-blur-md shadow-[0_-2px_8px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-out',
        opened ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {links.map(({ label, href, icon: Icon }) => {
          const isActive = activeId === href.slice(1)
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-foreground hover:text-primary',
                )}
              >
                <Icon size={20} strokeWidth={1.75} />
                {/* <span>{label}</span> */}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}