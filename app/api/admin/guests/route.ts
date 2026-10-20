import { requireAdminApi } from '@/lib/auth/admin'
import { errorResponse, json, readJson } from '@/lib/http'
import { buildInviteUrl, buildWhatsappUrl } from '@/lib/invitations/links'
import { issueInvitationToken } from '@/lib/invitations/issue'
import { guestInputSchema, guestUpdateSchema, uuidSchema } from '@/lib/validation/schemas'

function originOf(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await readJson(request)
  const parsed = guestInputSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid guest details.', 400)
  }

  const { data: guest, error } = await auth.admin.supabase
    .from('guests')
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      party_size_limit: parsed.data.party_size_limit,
    })
    .select('id, name, phone, party_size_limit, created_at')
    .single()

  if (error || !guest) return errorResponse('Could not add the guest.', 500)

  try {
    const token = await issueInvitationToken(guest.id)
    const url = buildInviteUrl(originOf(request), token)
    return json(
      {
        guest,
        invite: { url, whatsappUrl: buildWhatsappUrl({ name: guest.name, url, phone: guest.phone }) },
      },
      201,
    )
  } catch {
    return json({ guest, invite: null, warning: 'Guest added, but the invitation link could not be created.' }, 201)
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await readJson(request)
  const parsed = guestUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid guest details.', 400)
  }

  const { data, error } = await auth.admin.supabase
    .from('guests')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      party_size_limit: parsed.data.party_size_limit,
    })
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()

  if (error) return errorResponse('Could not update the guest.', 500)
  if (!data) return errorResponse('Guest not found.', 404)
  return json({ ok: true })
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = (await readJson(request)) as { id?: unknown } | null
  const id = uuidSchema.safeParse(body?.id)
  if (!id.success) return errorResponse('Invalid guest.', 400)

  const { data, error } = await auth.admin.supabase
    .from('guests')
    .delete()
    .eq('id', id.data)
    .select('id')
    .maybeSingle()

  if (error) return errorResponse('Could not delete the guest.', 500)
  if (!data) return errorResponse('Guest not found.', 404)
  return json({ ok: true })
}
