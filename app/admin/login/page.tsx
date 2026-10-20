import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { getAdminState } from '@/lib/auth/admin'

export const metadata: Metadata = { title: 'Admin sign in' }

export default async function AdminLoginPage() {
  const state = await getAdminState()
  if (state.status === 'admin') redirect('/admin')

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="eyebrow text-center">Wedding admin</p>
        <h1 className="font-display mt-2 text-center text-3xl">Sign in</h1>
        {state.status === 'forbidden' && (
          <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This account is not authorized to manage the wedding.
          </p>
        )}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
