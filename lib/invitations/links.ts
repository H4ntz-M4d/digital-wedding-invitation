import { wedding } from '@/config/wedding'

export function buildInviteUrl(origin: string, token: string): string {
  const base = origin.replace(/\/+$/, '')
  return `${base}/${wedding.slug}?invite=${encodeURIComponent(token)}`
}

export function buildWhatsappUrl(options: {
  name: string
  url: string
  phone?: string | null
}): string {
  const text = wedding.whatsappTemplate
    .replace('{name}', options.name)
    .replace('{url}', options.url)
  const digits = options.phone?.replace(/\D/g, '') ?? ''
  const target = digits.length >= 6 ? digits : ''
  return `https://wa.me/${target}?text=${encodeURIComponent(text)}`
}
