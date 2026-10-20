import { describe, expect, it } from 'vitest'
import { generateToken, hashToken, isWellFormedToken } from '@/lib/invitations/token'
import { tokenSchema } from '@/lib/validation/schemas'

describe('invitation tokens', () => {
  it('generates high-entropy URL-safe tokens that are unique', () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateToken()))
    expect(tokens.size).toBe(200)
    for (const token of tokens) {
      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(tokenSchema.safeParse(token).success).toBe(true)
    }
  })

  it('hashes deterministically and never returns the raw token', () => {
    const token = generateToken()
    const hash = hashToken(token)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).toBe(hashToken(token))
    expect(hash).not.toContain(token)
    expect(hashToken(generateToken())).not.toBe(hash)
  })

  it('rejects malformed tokens before any database lookup', () => {
    for (const value of [undefined, null, 42, {}, '', 'short', 'a'.repeat(44), `${'a'.repeat(42)}!`, "' or 1=1 --"]) {
      expect(isWellFormedToken(value)).toBe(false)
    }
    expect(isWellFormedToken(generateToken())).toBe(true)
  })
})
