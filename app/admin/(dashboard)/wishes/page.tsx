import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { WishActions } from '@/components/admin/wish-actions'
import { listWishes } from '@/lib/admin/data'
import { getAdminState } from '@/lib/auth/admin'
import { formatShortDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Wishes | Wedding admin' }

const filters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default async function WishesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const state = await getAdminState()
  if (state.status !== 'admin') return null
  const { status = '' } = await searchParams
  const wishes = await listWishes(state.supabase, status)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Wishes</h1>
        <p className="text-sm text-muted-foreground">Only approved wishes appear on the public invitation.</p>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
        {filters.map((filter) => {
          const active = status === filter.value
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/wishes?status=${filter.value}` : '/admin/wishes'}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm',
                active ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {filter.label}
            </Link>
          )
        })}
      </nav>

      {wishes.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          No wishes here yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {wishes.map((wish) => (
            <li
              key={wish.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{wish.guestName}</span>
                  <Badge variant={wish.status === 'approved' ? 'default' : wish.status === 'pending' ? 'secondary' : 'outline'}>
                    {wish.status}
                  </Badge>
                  <time dateTime={wish.createdAt} className="text-xs text-muted-foreground">
                    {formatShortDateTime(wish.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{wish.message}</p>
              </div>
              <WishActions id={wish.id} status={wish.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
