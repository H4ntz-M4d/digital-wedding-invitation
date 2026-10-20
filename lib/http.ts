import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export function json(data: unknown, init?: number | ResponseInit) {
  const responseInit = typeof init === 'number' ? { status: init } : init
  return NextResponse.json(data, {
    ...responseInit,
    headers: { 'Cache-Control': 'no-store', ...(responseInit?.headers ?? {}) },
  })
}

export function errorResponse(message: string, status: number, extra?: Record<string, unknown>) {
  return json({ error: message, ...extra }, status)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function readJson(request: Request): Promise<unknown | null> {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 20_000) return null
  try {
    return await request.json()
  } catch {
    return null
  }
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function limitRequest(request: Request, scope: string, limit: number, windowMs: number) {
  const result = rateLimit(`${scope}:${getClientIp(request)}`, limit, windowMs)
  if (result.ok) return null
  return errorResponse('Too many requests. Please wait a moment and try again.', 429, {
    retryAfterSeconds: result.retryAfterSeconds,
  })
}
