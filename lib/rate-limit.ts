type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 5000

/**
 * Sliding-window limiter held in memory. It is per server instance, so on Vercel
 * it only slows bursts; pair it with Vercel Firewall rate limiting for stronger protection.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { ok: boolean; retryAfterSeconds: number } {
  if (buckets.size > MAX_KEYS) {
    for (const [k, bucket] of buckets) {
      if (bucket.hits.every((t) => now - t > windowMs)) buckets.delete(k)
    }
    if (buckets.size > MAX_KEYS) buckets.clear()
  }

  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0]
    buckets.set(key, bucket)
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)) }
  }

  bucket.hits.push(now)
  buckets.set(key, bucket)
  return { ok: true, retryAfterSeconds: 0 }
}

export function resetRateLimits() {
  buckets.clear()
}
