import 'server-only'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/http'

export type AdminContext = {
  supabase: SupabaseClient
  user: User
  displayName: string
}

export type AdminState =
  | { status: 'anonymous' }
  | { status: 'forbidden'; email: string | undefined }
  | ({ status: 'admin' } & AdminContext)

/**
 * Verifies the session with Supabase Auth and then checks admin membership.
 * The admin_users lookup runs under RLS as the caller, so a user can only ever see their own row.
 */
export async function getAdminState(): Promise<AdminState> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { status: 'anonymous' }

  const { data: row } = await supabase
    .from('admin_users')
    .select('display_name')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!row) return { status: 'forbidden', email: data.user.email }
  return { status: 'admin', supabase, user: data.user, displayName: row.display_name }
}

/** For route handlers: returns the admin context or a ready-made 401/403 response. */
export async function requireAdminApi(): Promise<
  { ok: true; admin: AdminContext } | { ok: false; response: Response }
> {
  const state = await getAdminState()
  if (state.status === 'anonymous') {
    return { ok: false, response: errorResponse('Authentication required.', 401) }
  }
  if (state.status === 'forbidden') {
    return { ok: false, response: errorResponse('You are not authorized to manage this wedding.', 403) }
  }
  return { ok: true, admin: state }
}
