import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const tables = ['guests', 'invitation_tokens', 'rsvps', 'wishes', 'admin_users'] as const

// Live check against the connected Supabase project. Run with:
//   node --env-file=.env.local node_modules/vitest/vitest.mjs run tests/rls.test.ts
describe.skipIf(!url || !anonKey)('anonymous access is denied by RLS and grants', () => {
  const anon = createClient(url ?? 'http://localhost', anonKey ?? 'anon', {
    auth: { persistSession: false },
  })

  for (const table of tables) {
    it(`cannot read ${table}`, async () => {
      const { data, error } = await anon.from(table).select('*').limit(1)
      expect(error !== null || (data ?? []).length === 0).toBe(true)
    })

    it(`cannot write ${table}`, async () => {
      const { error } = await anon.from(table).insert({}).select()
      expect(error).not.toBeNull()
    })
  }

  it('cannot call is_admin()', async () => {
    const { error } = await anon.rpc('is_admin')
    expect(error).not.toBeNull()
  })
})
