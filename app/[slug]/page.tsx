import { notFound } from 'next/navigation'
import { wedding } from '@/config/wedding'
import { InvitationPage } from '@/components/invitation/invitation-page'

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  if (slug !== wedding.slug) notFound()
  return <InvitationPage searchParams={searchParams} />
}
