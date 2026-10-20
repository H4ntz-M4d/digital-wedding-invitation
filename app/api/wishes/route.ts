import { errorResponse, json, limitRequest, readJson } from '@/lib/http'
import { resolveInvitation } from '@/lib/invitations/resolve'
import { getApprovedWishes } from '@/lib/wishes'
import { createServiceClient } from '@/lib/supabase/admin'
import { wishSchema } from '@/lib/validation/schemas'

const MAX_WISHES_PER_GUEST_PER_DAY = 3

export async function GET(request: Request) {
  const limited = limitRequest(request, 'wishes-read', 60, 60_000)
  if (limited) return limited
  return json({ wishes: await getApprovedWishes() })
}

export async function POST(request: Request) {
  const limited = limitRequest(request, 'wishes-write', 5, 10 * 60_000)
  if (limited) return limited

  const body = await readJson(request)
  if (!body) return errorResponse('Invalid request.', 400)

  const parsed = wishSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Please check your wish.', 400)
  }
  const input = parsed.data

  if (input.website) return json({ ok: true })

  const invitation = input.token ? await resolveInvitation(input.token) : null
  if (input.token && !invitation) {
    return errorResponse('This invitation link is invalid or no longer active.', 403)
  }

  const guestName = input.guest_name ?? invitation?.guest.name
  if (!guestName) return errorResponse('Name is required', 400)

  const db = createServiceClient()

  if (invitation) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await db
      .from('wishes')
      .select('id', { count: 'exact', head: true })
      .eq('guest_id', invitation.guest.id)
      .gte('created_at', since)
    if ((count ?? 0) >= MAX_WISHES_PER_GUEST_PER_DAY) {
      return errorResponse('You have sent several wishes today. Please try again tomorrow.', 429)
    }
  }

  // moderation_status is intentionally never read from the request; the column default is 'pending'.
  const { error } = await db.from('wishes').insert({
    guest_id: invitation?.guest.id ?? null,
    guest_name: guestName,
    message: input.message,
    moderation_status: 'pending',
  })

  if (error) return errorResponse('We could not send your wish. Please try again.', 500)

  return json({ ok: true, status: 'pending' }, 201)
}
