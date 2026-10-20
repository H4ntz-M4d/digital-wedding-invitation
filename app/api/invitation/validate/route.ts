import { errorResponse, json, limitRequest, readJson } from '@/lib/http'
import { resolveInvitation } from '@/lib/invitations/resolve'

export async function POST(request: Request) {
  const limited = limitRequest(request, 'validate', 30, 60_000)
  if (limited) return limited

  const body = (await readJson(request)) as { token?: unknown } | null
  if (!body) return errorResponse('Invalid request.', 400)

  const invitation = await resolveInvitation(body.token)
  if (!invitation) return json({ valid: false })

  return json({
    valid: true,
    guest: { name: invitation.guest.name, partySizeLimit: invitation.guest.partySizeLimit },
    rsvp: invitation.rsvp,
  })
}
