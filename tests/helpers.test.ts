import { beforeEach, describe, expect, it } from 'vitest'
import { csvCell, toCsv } from '@/lib/csv'
import { rateLimit, resetRateLimits } from '@/lib/rate-limit'

describe('csv export', () => {
  it('neutralises spreadsheet formula injection', () => {
    for (const payload of ['=SUM(A1)', '+1+1', '-2+3', '@cmd', '\tcmd']) {
      expect(csvCell(payload).startsWith("'")).toBe(true)
    }
  })

  it('quotes cells containing commas, quotes and newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(csvCell(null)).toBe('')
    expect(csvCell(3)).toBe('3')
  })

  it('joins rows with CRLF', () => {
    expect(toCsv([['a', 'b'], [1, null]])).toBe('a,b\r\n1,')
  })
})

describe('rateLimit', () => {
  beforeEach(() => resetRateLimits())

  it('blocks requests beyond the limit and recovers after the window', () => {
    const start = 1_000_000
    expect(rateLimit('k', 2, 1000, start).ok).toBe(true)
    expect(rateLimit('k', 2, 1000, start + 10).ok).toBe(true)
    const blocked = rateLimit('k', 2, 1000, start + 20)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1)
    expect(rateLimit('k', 2, 1000, start + 1500).ok).toBe(true)
  })

  it('tracks keys independently', () => {
    expect(rateLimit('a', 1, 1000).ok).toBe(true)
    expect(rateLimit('b', 1, 1000).ok).toBe(true)
    expect(rateLimit('a', 1, 1000).ok).toBe(false)
  })
})
