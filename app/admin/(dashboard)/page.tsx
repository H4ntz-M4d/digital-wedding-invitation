import Link from 'next/link'
import { getAdminState } from '@/lib/auth/admin'
import { getDashboardStats } from '@/lib/admin/data'
import { buttonVariants } from '@/components/ui/button'

export const metadata = { title: 'Overview | Wedding admin' }

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-4xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const state = await getAdminState()
  if (state.status !== 'admin') return null
  const stats = await getDashboardStats(state.supabase)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of invitations, responses, and wishes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Guests" value={stats.guests} hint={`Capacity for ${stats.capacity} people`} />
        <Stat label="Active invitation links" value={stats.invited} />
        <Stat label="Responded" value={stats.responded} hint={`${stats.awaiting} awaiting`} />
        <Stat label="People attending" value={stats.attendingGuests} hint={`${stats.attendingParties} invitations`} />
        <Stat label="Declined" value={stats.declined} />
        <Stat label="Awaiting response" value={stats.awaiting} />
        <Stat label="Wishes pending review" value={stats.pendingWishes} />
        <Stat label="Total wishes" value={stats.totalWishes} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/guests" className={buttonVariants()}>
          Manage guests
        </Link>
        <Link href="/admin/wishes?status=pending" className={buttonVariants({ variant: 'outline' })}>
          Review wishes
        </Link>
        <a href="/api/admin/rsvps/export" className={buttonVariants({ variant: 'outline' })}>
          Export RSVPs (CSV)
        </a>
      </div>
    </div>
  )
}
