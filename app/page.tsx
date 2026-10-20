import { InvitationPage } from '@/components/invitation/invitation-page'

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return <InvitationPage searchParams={searchParams} />
}
