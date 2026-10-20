import { createHash, randomBytes } from 'node:crypto'

/** 32 random bytes = 256 bits of entropy, encoded as 43 base64url characters. */
export const TOKEN_BYTES = 32
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

/** The raw token has 256 bits of entropy, so an unsalted SHA-256 digest is sufficient for lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function isWellFormedToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value)
}
