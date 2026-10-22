import { resolveInvitation } from '@/lib/invitations/resolve'
import { isWellFormedToken } from '@/lib/invitations/token'
import { getApprovedWishes } from '@/lib/wishes'
import { ClosingSection } from './closing-section'
import { CoupleSection } from './couple-section'
import { EventsSection } from './events-section'
import { GiftSection } from './gift-section'
import { InvitationShell } from './invitation-shell'
import { OpeningSection } from './opening-section'
import { RsvpSection, type InviteState } from './rsvp-section'
import { StorySection } from './story-section'
import { VenueSection } from './venue-section'
import { WishesSection } from './wishes-section'
import { InvitationNav } from './invitation-nav'

export async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const rawToken = Array.isArray(params.invite) ? params.invite[0] : params.invite

  const [invitation, wishes] = await Promise.all([
    rawToken ? resolveInvitation(rawToken) : Promise.resolve(null),
    getApprovedWishes().catch(() => []),
  ])

  const inviteState: InviteState = invitation ? 'valid' : rawToken ? 'invalid' : 'none'
  const token = invitation && isWellFormedToken(rawToken) ? rawToken : null

  return (
    <InvitationShell guestName={invitation?.guest.name ?? null}>
      <InvitationNav />
      <main>
        <section id="home">
          <OpeningSection />
        </section>
        <section id="couple">
          <CoupleSection />
        </section>
        <section id="events">
          <EventsSection />
        </section>
        <VenueSection />
        <StorySection />
        <section id="gift">
          <GiftSection />
        </section>
        <section id="rsvp">
          <RsvpSection
            inviteState={inviteState}
            token={token}
            guest={invitation ? { name: invitation.guest.name, partySizeLimit: invitation.guest.partySizeLimit } : null}
            initialRsvp={invitation?.rsvp ?? null}
          />
        </section>
        <WishesSection wishes={wishes} token={token} guestName={invitation?.guest.name ?? null} />
      </main>
      <ClosingSection />
    </InvitationShell>
  )
}
