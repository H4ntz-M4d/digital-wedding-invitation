import 'server-only'
import { createServiceClient } from '@/lib/supabase/admin'

export type PublicWish = {
  id: string
  guestName: string
  message: string
  createdAt: string
}

/** Public wishes: approved only, and never including guest ids. */
export async function getApprovedWishes(limit = 50): Promise<PublicWish[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('wishes')
    .select('id, guest_name, message, created_at')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((row) => ({
    id: row.id,
    guestName: row.guest_name,
    message: row.message,
    createdAt: row.created_at,
  }))
}
