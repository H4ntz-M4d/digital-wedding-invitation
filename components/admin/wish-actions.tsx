'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'pending' | 'approved' | 'rejected'

export function WishActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(request: () => Promise<Response>) {
    setBusy(true)
    setError(null)
    try {
      const response = await request()
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? 'Action failed.')
        return
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const moderate = (next: Status) =>
    run(() =>
      fetch('/api/admin/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      }),
    )

  const remove = () => {
    if (!window.confirm('Delete this wish permanently?')) return
    return run(() =>
      fetch('/api/admin/wishes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }),
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {status !== 'approved' && (
          <Button size="sm" disabled={busy} onClick={() => moderate('approved')}>
            <Check className="size-4" aria-hidden />
            Approve
          </Button>
        )}
        {status !== 'rejected' && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => moderate('rejected')}>
            <X className="size-4" aria-hidden />
            Reject
          </Button>
        )}
        {status !== 'pending' && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => moderate('pending')} aria-label="Move back to pending">
            <Undo2 className="size-4" aria-hidden />
          </Button>
        )}
        <Button size="icon" variant="ghost" disabled={busy} onClick={remove} aria-label="Delete wish">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
