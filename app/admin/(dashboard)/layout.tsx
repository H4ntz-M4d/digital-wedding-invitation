import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'
import { getAdminState } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminState()
  if (state.status !== 'admin') redirect('/admin/login')

  return (
    <div className="min-h-svh bg-muted/40">
      <AdminNav displayName={state.displayName} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
