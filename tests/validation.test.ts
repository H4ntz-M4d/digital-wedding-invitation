import { describe, expect, it } from 'vitest'
import {
  checkGuestCount,
  guestInputSchema,
  rsvpSchema,
  wishSchema,
  wishModerationSchema,
} from '@/lib/validation/schemas'
import { maxRsvpNoteLength, maxWishLength } from '@/config/wedding'

describe('checkGuestCount', () => {
  it('requires zero guests when declining', () => {
    expect(checkGuestCount('declined', 0, 4)).toBeNull()
    expect(checkGuestCount('declined', 1, 4)).not.toBeNull()
  })

  it('requires at least one and at most the party limit when attending', () => {
    expect(checkGuestCount('attending', 0, 4)).not.toBeNull()
    expect(checkGuestCount('attending', 1, 4)).toBeNull()
    expect(checkGuestCount('attending', 4, 4)).toBeNull()
    expect(checkGuestCount('attending', 5, 4)).toMatch(/up to 4 guests/)
    expect(checkGuestCount('attending', 2, 1)).toMatch(/up to 1 guest\b/)
  })
})

describe('rsvpSchema', () => {
  it('accepts a valid response and normalises an empty note to null', () => {
    const parsed = rsvpSchema.parse({ token: 'x', attendance_status: 'attending', guest_count: 2, message: '   ' })
    expect(parsed.message).toBeNull()
  })

  it('rejects unknown statuses and non-integer counts', () => {
    expect(rsvpSchema.safeParse({ attendance_status: 'maybe', guest_count: 1 }).success).toBe(false)
    expect(rsvpSchema.safeParse({ attendance_status: 'attending', guest_count: 1.5 }).success).toBe(false)
    expect(rsvpSchema.safeParse({ attendance_status: 'attending', guest_count: -1 }).success).toBe(false)
    expect(rsvpSchema.safeParse({ attendance_status: 'attending', guest_count: '2' }).success).toBe(false)
  })

  it('enforces the note length limit', () => {
    const long = 'a'.repeat(maxRsvpNoteLength + 1)
    expect(rsvpSchema.safeParse({ attendance_status: 'declined', guest_count: 0, message: long }).success).toBe(false)
  })
})

describe('wishSchema', () => {
  it('trims input and strips control characters', () => {
    const parsed = wishSchema.parse({ guest_name: '  Ayu\u0000  ', message: '  Congrats!\u0007 ' })
    expect(parsed.guest_name).toBe('Ayu')
    expect(parsed.message).toBe('Congrats!')
  })

  it('rejects empty and oversized messages', () => {
    expect(wishSchema.safeParse({ message: '   ' }).success).toBe(false)
    expect(wishSchema.safeParse({ message: 'a'.repeat(maxWishLength + 1) }).success).toBe(false)
  })
})

describe('admin schemas', () => {
  it('validates guest input', () => {
    expect(guestInputSchema.safeParse({ name: 'Budi', phone: '+62 812-3456-7890', party_size_limit: 2 }).success).toBe(true)
    expect(guestInputSchema.safeParse({ name: 'Budi', phone: '', party_size_limit: 2 }).success).toBe(true)
    expect(guestInputSchema.safeParse({ name: '', party_size_limit: 2 }).success).toBe(false)
    expect(guestInputSchema.safeParse({ name: 'Budi', phone: 'abc', party_size_limit: 2 }).success).toBe(false)
    expect(guestInputSchema.safeParse({ name: 'Budi', party_size_limit: 0 }).success).toBe(false)
    expect(guestInputSchema.safeParse({ name: 'Budi', party_size_limit: 21 }).success).toBe(false)
  })

  it('only allows known moderation statuses', () => {
    const id = '3f1c2b4e-8a6d-4e0f-9b1a-2c3d4e5f6a7b'
    expect(wishModerationSchema.safeParse({ id, status: 'approved' }).success).toBe(true)
    expect(wishModerationSchema.safeParse({ id, status: 'deleted' }).success).toBe(false)
  })
})
