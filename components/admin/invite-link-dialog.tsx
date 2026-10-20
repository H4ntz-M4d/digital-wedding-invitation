'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export type IssuedInvite = { guestName: string; url: string; whatsappUrl: string }

export function InviteLinkDialog({ invite, onClose }: { invite: IssuedInvite | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={invite !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitation link for {invite?.guestName}</DialogTitle>
          <DialogDescription>
            Copy this link now. For security only a hash is stored, so it cannot be shown again. Generating a new
            link disables this one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input readOnly value={invite?.url ?? ''} aria-label="Personal invitation link" onFocus={(e) => e.currentTarget.select()} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copy}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            {invite && (
              <a
                href={invite.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline' })}
              >
                <MessageCircle className="size-4" aria-hidden />
                Share on WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
