import { requireAdminApi } from '@/lib/auth/admin'
import { toCsv } from '@/lib/csv'
import { errorResponse } from '@/lib/http'

export async function GET() {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const { data, error } = await auth.admin.supabase
    .from('rsvps')
    .select('attendance_status, guest_count, message, created_at, updated_at, guest:guests(name, party_size_limit)')
    .order('updated_at', { ascending: false })

  if (error) return errorResponse('Could not export RSVPs.', 500)

  const rows = (data ?? []).map((row) => {
    const guest = Array.isArray(row.guest) ? row.guest[0] : row.guest
    return [
      guest?.name ?? '',
      row.attendance_status,
      row.guest_count,
      guest?.party_size_limit ?? '',
      row.message ?? '',
      row.created_at,
      row.updated_at,
    ]
  })

  const csv = toCsv([
    ['Guest', 'Status', 'Guest count', 'Party limit', 'Note', 'Submitted at', 'Updated at'],
    ...rows,
  ])

  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rsvps.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
