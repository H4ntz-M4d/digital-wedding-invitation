import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/admin'

export type TokenStatus = 'active' | 'revoked' | 'none'

export type GuestRow = {
  id: string
  name: string
  phone: string | null
  partySizeLimit: number
  createdAt: string
  tokenStatus: TokenStatus
  rsvp: { status: 'attending' | 'declined'; guestCount: number } | null
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export async function getTokenStatuses(guestIds: string[]): Promise<Map<string, TokenStatus>> {
  const statuses = new Map<string, TokenStatus>()
  if (guestIds.length === 0) return statuses

  const { data } = await createServiceClient()
    .from('invitation_tokens')
    .select('guest_id, revoked_at')
    .in('guest_id', guestIds)

  for (const row of data ?? []) {
    const current = statuses.get(row.guest_id)
    if (!row.revoked_at) statuses.set(row.guest_id, 'active')
    else if (current !== 'active') statuses.set(row.guest_id, 'revoked')
  }
  return statuses
}

export async function listGuests(supabase: SupabaseClient, query: string): Promise<GuestRow[]> {
  let request = supabase
    .from('guests')
    .select('id, name, phone, party_size_limit, created_at, rsvp:rsvps(attendance_status, guest_count)')
    .order('created_at', { ascending: false })
    .limit(500)

  const term = query.trim().slice(0, 80).replace(/[%_\\]/g, (c) => `\\${c}`)
  if (term) request = request.ilike('name', `%${term}%`)

  const { data } = await request
  const rows = data ?? []
  const statuses = await getTokenStatuses(rows.map((r) => r.id))

  return rows.map((row) => {
    const rsvp = first(row.rsvp as { attendance_status: 'attending' | 'declined'; guest_count: number }[] | null)
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      partySizeLimit: row.party_size_limit,
      createdAt: row.created_at,
      tokenStatus: statuses.get(row.id) ?? 'none',
      rsvp: rsvp ? { status: rsvp.attendance_status, guestCount: rsvp.guest_count } : null,
    }
  })
}

export type RsvpRow = {
  id: string
  guestName: string
  status: 'attending' | 'declined'
  guestCount: number
  message: string | null
  updatedAt: string
}

export async function listRsvps(
  supabase: SupabaseClient,
  filters: { status?: string; query?: string },
): Promise<RsvpRow[]> {
  const { data } = await supabase
    .from('rsvps')
    .select('id, attendance_status, guest_count, message, updated_at, guest:guests(name)')
    .order('updated_at', { ascending: false })
    .limit(1000)

  const query = filters.query?.trim().toLowerCase() ?? ''
  return (data ?? [])
    .map((row) => ({
      id: row.id,
      guestName: first(row.guest as { name: string }[] | null)?.name ?? 'Unknown guest',
      status: row.attendance_status as 'attending' | 'declined',
      guestCount: row.guest_count,
      message: row.message,
      updatedAt: row.updated_at,
    }))
    .filter((row) => (filters.status === 'attending' || filters.status === 'declined' ? row.status === filters.status : true))
    .filter((row) => (query ? row.guestName.toLowerCase().includes(query) : true))
}

export type WishRow = {
  id: string
  guestName: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export async function listWishes(supabase: SupabaseClient, status?: string): Promise<WishRow[]> {
  let request = supabase
    .from('wishes')
    .select('id, guest_name, message, moderation_status, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    request = request.eq('moderation_status', status)
  }

  const { data } = await request
  return (data ?? []).map((row) => ({
    id: row.id,
    guestName: row.guest_name,
    message: row.message,
    status: row.moderation_status as WishRow['status'],
    createdAt: row.created_at,
  }))
}

export type DashboardStats = {
  guests: number
  invited: number
  responded: number
  attendingParties: number
  attendingGuests: number
  declined: number
  awaiting: number
  pendingWishes: number
  totalWishes: number
  capacity: number
}

export async function getDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
  const [guests, rsvps, wishes] = await Promise.all([
    supabase.from('guests').select('id, party_size_limit').limit(5000),
    supabase.from('rsvps').select('attendance_status, guest_count').limit(5000),
    supabase.from('wishes').select('moderation_status').limit(5000),
  ])

  const guestRows = guests.data ?? []
  const rsvpRows = rsvps.data ?? []
  const wishRows = wishes.data ?? []
  const statuses = await getTokenStatuses(guestRows.map((g) => g.id))

  const attending = rsvpRows.filter((r) => r.attendance_status === 'attending')
  return {
    guests: guestRows.length,
    invited: [...statuses.values()].filter((s) => s === 'active').length,
    responded: rsvpRows.length,
    attendingParties: attending.length,
    attendingGuests: attending.reduce((sum, r) => sum + r.guest_count, 0),
    declined: rsvpRows.length - attending.length,
    awaiting: Math.max(0, guestRows.length - rsvpRows.length),
    pendingWishes: wishRows.filter((w) => w.moderation_status === 'pending').length,
    totalWishes: wishRows.length,
    capacity: guestRows.reduce((sum, g) => sum + g.party_size_limit, 0),
  }
}
