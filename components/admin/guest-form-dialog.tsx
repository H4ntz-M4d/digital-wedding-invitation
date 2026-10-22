'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { IssuedInvite } from './invite-link-dialog'

export type GuestFormValues = { id?: string; name: string; phone: string; partySizeLimit: number }

type GuestFormDialogProps = {
  open: boolean
  initial: GuestFormValues | null
  onOpenChange: (open: boolean) => void
  onSaved: (invite: IssuedInvite | null) => void
}

const emptyGuest: GuestFormValues = { name: '', phone: '', partySizeLimit: 1 }

export function GuestFormDialog({ open, initial, onOpenChange, onSaved }: GuestFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <GuestForm key={initial?.id ?? 'new'} initial={initial ?? emptyGuest} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}

function GuestForm({ initial, onSaved }: { initial: GuestFormValues; onSaved: GuestFormDialogProps['onSaved'] }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const editing = Boolean(initial.id)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/guests', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initial.id,
          name: values.name,
          phone: values.phone.trim() || null,
          party_size_limit: values.partySizeLimit,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error ?? 'Could not save the guest.')
        return
      }
      onSaved(
        data.invite
          ? { guestName: data.guest.name, url: data.invite.url, whatsappUrl: data.invite.whatsappUrl }
          : null,
      )
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? 'Edit guest' : 'Add guest'}</DialogTitle>
        <DialogDescription>
          {editing
            ? 'Update the guest details. Their invitation link stays the same.'
            : 'A personal invitation link is created automatically when you save.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-name">Name</Label>
          <Input
            id="guest-name"
            required
            maxLength={120}
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-phone">WhatsApp number</Label>
          <Input
            id="guest-phone"
            type="tel"
            inputMode="tel"
            maxLength={32}
            placeholder="+62 812 3456 7890"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-limit">Maximum people on this invitation</Label>
          <Input
            id="guest-limit"
            type="number"
            min={1}
            max={20}
            required
            value={values.partySizeLimit}
            onChange={(e) => setValues({ ...values, partySizeLimit: Number(e.target.value) })}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {editing ? 'Save changes' : 'Add guest'}
        </Button>
      </form>
    </>
  )
}
