import Link from 'next/link'
import { Download, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listRsvps } from '@/lib/admin/data'
import { getAdminState } from '@/lib/auth/admin'
import { formatShortDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'RSVPs | Wedding admin' }

const filters = [
  { value: '', label: 'All' },
  { value: 'attending', label: 'Attending' },
  { value: 'declined', label: 'Declined' },
]

export default async function RsvpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const state = await getAdminState()
  if (state.status !== 'admin') return null
  const { status = '', q = '' } = await searchParams
  const rsvps = await listRsvps(state.supabase, { status, query: q })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">RSVPs</h1>
          <p className="text-sm text-muted-foreground">{rsvps.length} responses shown.</p>
        </div>
        <a href="/api/admin/rsvps/export" className={buttonVariants({ variant: 'outline' })}>
          <Download className="size-4" aria-hidden />
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex gap-1">
          {filters.map((filter) => {
            const active = status === filter.value
            const href = `/admin/rsvps?${new URLSearchParams({
              ...(filter.value ? { status: filter.value } : {}),
              ...(q ? { q } : {}),
            }).toString()}`
            return (
              <Link
                key={filter.label}
                href={href}
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
        <form className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search RSVPs" className="w-56" />
          <Button type="submit" variant="outline">
            <Search className="size-4" aria-hidden />
            Search
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>People</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rsvps.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No RSVPs match your filters.
                </TableCell>
              </TableRow>
            )}
            {rsvps.map((rsvp) => (
              <TableRow key={rsvp.id}>
                <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                <TableCell>
                  <Badge variant={rsvp.status === 'attending' ? 'default' : 'outline'}>
                    {rsvp.status === 'attending' ? 'Attending' : 'Declined'}
                  </Badge>
                </TableCell>
                <TableCell>{rsvp.guestCount}</TableCell>
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">{rsvp.message ?? '-'}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatShortDateTime(rsvp.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
