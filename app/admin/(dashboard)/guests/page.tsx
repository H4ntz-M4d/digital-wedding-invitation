import { Search } from 'lucide-react'
import { GuestsManager } from '@/components/admin/guests-manager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listGuests } from '@/lib/admin/data'
import { getAdminState } from '@/lib/auth/admin'

export const metadata = { title: 'Guests | Wedding admin' }

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const state = await getAdminState()
  if (state.status !== 'admin') return null
  const { q = '' } = await searchParams
  const guests = await listGuests(state.supabase, q)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Guests</h1>
          <p className="text-sm text-muted-foreground">
            Each guest receives a personal link. Links are shown once when created.
          </p>
        </div>
        <form className="flex gap-2" role="search">
          <Input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search guests" className="w-56" />
          <Button type="submit" variant="outline">
            <Search className="size-4" aria-hidden />
            Search
          </Button>
        </form>
      </div>
      <GuestsManager guests={guests} />
    </div>
  )
}
