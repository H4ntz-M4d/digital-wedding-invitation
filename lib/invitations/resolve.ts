import 'server-only'
import { createServiceClient } from '@/lib/supabase/admin'
import { hashToken, isWellFormedToken } from './token'

export type InvitedGuest = {
  id: string
  name: string
  partySizeLimit: number
}

export type PublicRsvp = {
  attendanceStatus: 'attending' | 'declined'
  guestCount: number
  message: string | null
  updatedAt: string
}

export type ResolvedInvitation = {
  guest: InvitedGuest
  rsvp: PublicRsvp | null
}

/**
 * Resolves a raw invitation token to a guest on the server.
 * Returns null for missing, malformed, unknown or revoked tokens.
 * Only the fields the public page needs are returned (never the phone number).
 */
export async function resolveInvitation(token: unknown): Promise<ResolvedInvitation | null> {
  if (!isWellFormedToken(token)) return null

  const db = createServiceClient()
  const { data: tokenRow, error } = await db
    .from('invitation_tokens')
    .select('guest:guests(id, name, party_size_limit)')
    .eq('token_hash', hashToken(token))
    .is('revoked_at', null)
    .maybeSingle()

  if (error || !tokenRow) return null

  const guestRow = Array.isArray(tokenRow.guest) ? tokenRow.guest[0] : tokenRow.guest
  if (!guestRow) return null

  const { data: rsvpRow } = await db
    .from('rsvps')
    .select('attendance_status, guest_count, message, updated_at')
    .eq('guest_id', guestRow.id)
    .maybeSingle()

  return {
    guest: {
      id: guestRow.id,
      name: guestRow.name,
      partySizeLimit: guestRow.party_size_limit,
    },
    rsvp: rsvpRow
      ? {
          attendanceStatus: rsvpRow.attendance_status,
          guestCount: rsvpRow.guest_count,
          message: rsvpRow.message,
          updatedAt: rsvpRow.updated_at,
        }
      : null,
  }
}
