'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/guests', label: 'Guests' },
  { href: '/admin/rsvps', label: 'RSVPs' },
  { href: '/admin/wishes', label: 'Wishes' },
]

export function AdminNav({ displayName }: { displayName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="font-display text-xl">Wedding admin</span>
          <nav aria-label="Admin" className="flex items-center gap-1">
            {links.map((link) => {
              const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{displayName}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
