import 'server-only'
import { createServiceClient } from '@/lib/supabase/admin'
import { generateToken, hashToken } from './token'

/**
 * Revokes any active token for the guest and stores a hash of a fresh one.
 * The raw token is returned once so the admin can share it; it is never persisted or logged.
 */
export async function issueInvitationToken(guestId: string): Promise<string> {
  const db = createServiceClient()

  const { error: revokeError } = await db
    .from('invitation_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('guest_id', guestId)
    .is('revoked_at', null)
  if (revokeError) throw new Error('Could not revoke previous invitation')

  const token = generateToken()
  const { error } = await db
    .from('invitation_tokens')
    .insert({ guest_id: guestId, token_hash: hashToken(token) })
  if (error) throw new Error('Could not create invitation')

  return token
}

export async function revokeInvitationTokens(guestId: string): Promise<number> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('invitation_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('guest_id', guestId)
    .is('revoked_at', null)
    .select('id')
  if (error) throw new Error('Could not revoke invitation')
  return data?.length ?? 0
}
