import { requireAdminApi } from '@/lib/auth/admin'
import { errorResponse, json } from '@/lib/http'
import { issueInvitationToken, revokeInvitationTokens } from '@/lib/invitations/issue'
import { buildInviteUrl, buildWhatsappUrl } from '@/lib/invitations/links'
import { uuidSchema } from '@/lib/validation/schemas'

type Context = { params: Promise<{ id: string }> }

/** Issues (or regenerates) the personal link. Any previously active link stops working. */
export async function POST(request: Request, { params }: Context) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const id = uuidSchema.safeParse((await params).id)
  if (!id.success) return errorResponse('Invalid guest.', 400)

  // Reading through the admin's RLS client confirms the guest exists and the caller may see it.
  const { data: guest } = await auth.admin.supabase
    .from('guests')
    .select('id, name, phone')
    .eq('id', id.data)
    .maybeSingle()
  if (!guest) return errorResponse('Guest not found.', 404)

  try {
    const token = await issueInvitationToken(guest.id)
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    const url = buildInviteUrl(origin, token)
    return json({
      invite: { url, whatsappUrl: buildWhatsappUrl({ name: guest.name, url, phone: guest.phone }) },
    })
  } catch {
    return errorResponse('Could not create the invitation link.', 500)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const id = uuidSchema.safeParse((await params).id)
  if (!id.success) return errorResponse('Invalid guest.', 400)

  const { data: guest } = await auth.admin.supabase
    .from('guests')
    .select('id')
    .eq('id', id.data)
    .maybeSingle()
  if (!guest) return errorResponse('Guest not found.', 404)

  try {
    const revoked = await revokeInvitationTokens(guest.id)
    return json({ ok: true, revoked })
  } catch {
    return errorResponse('Could not revoke the invitation.', 500)
  }
}
