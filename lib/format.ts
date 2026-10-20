import { wedding } from '@/config/wedding'

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: wedding.timezone,
  }).format(new Date(iso))
}

export function formatShortDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: wedding.timezone,
  }).format(new Date(iso))
}

function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function googleCalendarUrl(options: {
  title: string
  start: string
  durationHours?: number
  location: string
  details: string
}): string {
  const start = new Date(options.start)
  const end = new Date(start.getTime() + (options.durationHours ?? 2) * 3_600_000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: options.title,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    location: options.location,
    details: options.details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function splitCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
