#!/usr/bin/env node
// Creates or removes a wedding admin. Uses the service role key, so run it only
// from a trusted machine:
//   node --env-file=.env.local scripts/manage-admin.mjs add you@example.com "Your Name"
//   node --env-file=.env.local scripts/manage-admin.mjs remove you@example.com
// `add` prompts for a password when ADMIN_PASSWORD is not set.
import { createClient } from '@supabase/supabase-js'
import { createInterface } from 'node:readline/promises'

const [, , command, email, displayName] = process.argv
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey || !['add', 'remove'].includes(command ?? '') || !email) {
  console.error('Usage: manage-admin.mjs <add|remove> <email> [display name]')
  console.error('Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function findUser(address) {
  let page = 1
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === address.toLowerCase())
    if (match) return match
    if (data.users.length < 200) return null
    page += 1
  }
}

async function readPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const password = await rl.question('Password for the new admin (min 8 characters): ')
  rl.close()
  return password
}

if (command === 'add') {
  let user = await findUser(email)
  if (!user) {
    const password = await readPassword()
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) throw error
    user = data.user
    console.log(`Created auth user ${email}`)
  }
  const { error } = await supabase
    .from('admin_users')
    .upsert({ user_id: user.id, display_name: displayName || email.split('@')[0] }, { onConflict: 'user_id' })
  if (error) throw error
  console.log(`${email} is now a wedding admin.`)
} else {
  const user = await findUser(email)
  if (!user) {
    console.log('No such user.')
    process.exit(0)
  }
  const { error } = await supabase.from('admin_users').delete().eq('user_id', user.id)
  if (error) throw error
  console.log(`${email} is no longer an admin. The auth user was kept; delete it in Supabase if needed.`)
}
