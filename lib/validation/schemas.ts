import { z } from 'zod'
import { maxRsvpNoteLength, maxWishLength } from '@/config/wedding'

const cleanText = (max: number) =>
  z
    .string()
    .transform((value) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim())
    .pipe(z.string().max(max))

const requiredText = (max: number, label: string) =>
  cleanText(max).pipe(z.string().min(1, `${label} is required`))

export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, 'Invalid invitation')

export const validateBodySchema = z.object({ token: z.unknown() })

export const rsvpSchema = z
  .object({
    token: z.unknown(),
    attendance_status: z.enum(['attending', 'declined']),
    guest_count: z.number().int().min(0).max(20),
    message: cleanText(maxRsvpNoteLength).optional().nullable(),
    website: z.string().optional(),
  })
  .transform((value) => ({
    ...value,
    message: value.message ? value.message : null,
  }))

export const wishSchema = z.object({
  token: z.unknown().optional(),
  guest_name: requiredText(80, 'Name').optional(),
  message: requiredText(maxWishLength, 'Message'),
  website: z.string().optional(),
})

export const guestInputSchema = z.object({
  name: requiredText(120, 'Name'),
  phone: cleanText(32)
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().regex(/^[+\d][\d\s\-()]{4,30}$/, 'Enter a valid phone number').nullable())
    .optional()
    .nullable(),
  party_size_limit: z.number().int().min(1).max(20),
})

export const guestUpdateSchema = guestInputSchema.extend({ id: z.uuid() })

export const uuidSchema = z.uuid()

export const wishModerationSchema = z.object({
  id: z.uuid(),
  status: z.enum(['approved', 'rejected', 'pending']),
})

export type RsvpInput = z.infer<typeof rsvpSchema>

/**
 * Checks the guest-count rules that depend on the guest's party size limit.
 * Returns an error message, or null when the combination is valid.
 */
export function checkGuestCount(
  status: 'attending' | 'declined',
  guestCount: number,
  partySizeLimit: number,
): string | null {
  if (status === 'declined') {
    return guestCount === 0 ? null : 'A declined response must have a guest count of 0.'
  }
  if (guestCount < 1) return 'Please confirm at least 1 attendee.'
  if (guestCount > partySizeLimit) {
    return `Your invitation allows up to ${partySizeLimit} ${partySizeLimit === 1 ? 'guest' : 'guests'}.`
  }
  return null
}
