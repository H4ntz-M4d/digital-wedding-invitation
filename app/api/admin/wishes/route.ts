import { requireAdminApi } from '@/lib/auth/admin'
import { errorResponse, json, readJson } from '@/lib/http'
import { uuidSchema, wishModerationSchema } from '@/lib/validation/schemas'

export async function PATCH(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const parsed = wishModerationSchema.safeParse(await readJson(request))
  if (!parsed.success) return errorResponse('Invalid moderation request.', 400)

  const { data, error } = await auth.admin.supabase
    .from('wishes')
    .update({
      moderation_status: parsed.data.status,
      moderated_at: parsed.data.status === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()

  if (error) return errorResponse('Could not update the wish.', 500)
  if (!data) return errorResponse('Wish not found.', 404)
  return json({ ok: true })
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = (await readJson(request)) as { id?: unknown } | null
  const id = uuidSchema.safeParse(body?.id)
  if (!id.success) return errorResponse('Invalid wish.', 400)

  const { data, error } = await auth.admin.supabase
    .from('wishes')
    .delete()
    .eq('id', id.data)
    .select('id')
    .maybeSingle()

  if (error) return errorResponse('Could not delete the wish.', 500)
  if (!data) return errorResponse('Wish not found.', 404)
  return json({ ok: true })
}
