import { errorResponse, json, limitRequest, readJson } from '@/lib/http'
import { resolveInvitation } from '@/lib/invitations/resolve'
import { createServiceClient } from '@/lib/supabase/admin'
import { checkGuestCount, rsvpSchema } from '@/lib/validation/schemas'

export async function POST(request: Request) {
  const limited = limitRequest(request, 'rsvp', 10, 10 * 60_000)
  if (limited) return limited

  const body = await readJson(request)
  if (!body) return errorResponse('Invalid request.', 400)

  const parsed = rsvpSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Please check your answers.', 400)
  }
  const input = parsed.data

  if (input.website) {
    return json({ ok: true })
  }

  // The guest is always resolved from the token; no guest id is accepted from the browser.
  const invitation = await resolveInvitation(input.token)
  if (!invitation) {
    return errorResponse('This invitation link is invalid or no longer active.', 403)
  }

  const guestCount = input.attendance_status === 'declined' ? 0 : input.guest_count
  const countError = checkGuestCount(
    input.attendance_status,
    guestCount,
    invitation.guest.partySizeLimit,
  )
  if (countError) return errorResponse(countError, 400)

  const db = createServiceClient()
  const { data, error } = await db
    .from('rsvps')
    .upsert(
      {
        guest_id: invitation.guest.id,
        attendance_status: input.attendance_status,
        guest_count: guestCount,
        message: input.message,
      },
      { onConflict: 'guest_id' },
    )
    .select('attendance_status, guest_count, message, updated_at')
    .single()

  if (error || !data) {
    return errorResponse('We could not save your RSVP. Please try again.', 500)
  }

  return json({
    ok: true,
    updated: invitation.rsvp !== null,
    rsvp: {
      attendanceStatus: data.attendance_status,
      guestCount: data.guest_count,
      message: data.message,
      updatedAt: data.updated_at,
    },
  })
}
