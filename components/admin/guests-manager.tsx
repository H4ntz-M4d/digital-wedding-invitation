'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Pencil, Plus, Trash2, Ban } from 'lucide-react'
import type { GuestRow } from '@/lib/admin/data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GuestFormDialog, type GuestFormValues } from './guest-form-dialog'
import { InviteLinkDialog, type IssuedInvite } from './invite-link-dialog'

type PendingAction =
  | { kind: 'delete'; guest: GuestRow }
  | { kind: 'revoke'; guest: GuestRow }
  | { kind: 'regenerate'; guest: GuestRow }

const tokenLabels = { active: 'Active', revoked: 'Revoked', none: 'None' } as const

export function GuestsManager({ guests }: { guests: GuestRow[] }) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<GuestFormValues | null>(null)
  const [invite, setInvite] = useState<IssuedInvite | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openForm(guest?: GuestRow) {
    setEditing(
      guest ? { id: guest.id, name: guest.name, phone: guest.phone ?? '', partySizeLimit: guest.partySizeLimit } : null,
    )
    setFormOpen(true)
  }

  async function issueLink(guest: GuestRow) {
    setError(null)
    const response = await fetch(`/api/admin/guests/${guest.id}/token`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error ?? 'Could not create the invitation link.')
      return
    }
    setInvite({ guestName: guest.name, url: data.invite.url, whatsappUrl: data.invite.whatsappUrl })
    router.refresh()
  }

  async function confirmPending() {
    if (!pending) return
    const { kind, guest } = pending
    setPending(null)
    setError(null)

    if (kind === 'regenerate') return issueLink(guest)

    const response =
      kind === 'delete'
        ? await fetch('/api/admin/guests', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: guest.id }),
          })
        : await fetch(`/api/admin/guests/${guest.id}/token`, { method: 'DELETE' })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error ?? 'That action failed. Please try again.')
      return
    }
    router.refresh()
  }

  const copy = {
    delete: {
      title: 'Delete this guest?',
      description: 'The guest, their RSVP, and their invitation links are permanently removed.',
      action: 'Delete guest',
    },
    revoke: {
      title: 'Revoke the invitation link?',
      description: 'The guest will no longer be able to open their personal link or RSVP with it.',
      action: 'Revoke link',
    },
    regenerate: {
      title: 'Generate a new link?',
      description: 'The current link stops working immediately. Share the new link with the guest.',
      action: 'Generate new link',
    },
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => openForm()}>
          <Plus className="size-4" aria-hidden />
          Add guest
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Invitation</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No guests yet. Add your first guest to create a personal invitation link.
                </TableCell>
              </TableRow>
            )}
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <p className="font-medium">{guest.name}</p>
                  {guest.phone && <p className="text-xs text-muted-foreground">{guest.phone}</p>}
                </TableCell>
                <TableCell>{guest.partySizeLimit}</TableCell>
                <TableCell>
                  <Badge variant={guest.tokenStatus === 'active' ? 'default' : 'secondary'}>
                    {tokenLabels[guest.tokenStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {guest.rsvp ? (
                    <Badge variant={guest.rsvp.status === 'attending' ? 'default' : 'outline'}>
                      {guest.rsvp.status === 'attending' ? `Attending (${guest.rsvp.guestCount})` : 'Declined'}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Awaiting</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`${guest.tokenStatus === 'active' ? 'Regenerate' : 'Generate'} link for ${guest.name}`}
                      onClick={() =>
                        guest.tokenStatus === 'active' ? setPending({ kind: 'regenerate', guest }) : issueLink(guest)
                      }
                    >
                      <Link2 className="size-4" />
                    </Button>
                    {guest.tokenStatus === 'active' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Revoke link for ${guest.name}`}
                        onClick={() => setPending({ kind: 'revoke', guest })}
                      >
                        <Ban className="size-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" aria-label={`Edit ${guest.name}`} onClick={() => openForm(guest)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${guest.name}`}
                      onClick={() => setPending({ kind: 'delete', guest })}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GuestFormDialog
        open={formOpen}
        initial={editing}
        onOpenChange={setFormOpen}
        onSaved={(issued) => {
          setFormOpen(false)
          if (issued) setInvite(issued)
          router.refresh()
        }}
      />
      <InviteLinkDialog invite={invite} onClose={() => setInvite(null)} />

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending && copy[pending.kind].title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && `${pending.guest.name}: ${copy[pending.kind].description}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPending}>{pending && copy[pending.kind].action}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
