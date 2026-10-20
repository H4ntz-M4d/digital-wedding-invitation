/**
 * Single source of truth for all static wedding content.
 * Edit this file and redeploy to change anything shown on the invitation.
 * Images live in /public/images and music in /public/audio.
 */

export type Person = {
  fullName: string
  nickname: string
  title: string
  parents: string
  bio: string
  photo: string
  instagram?: string
}

export type WeddingEvent = {
  id: string
  title: string
  /** ISO 8601 with offset, e.g. 2027-03-20T08:00:00+07:00 */
  start: string
  /** Display time range */
  timeLabel: string
  note: string
}

export const wedding = {
  slug: 'yusuf-delila',
  timezone: 'Asia/Jakarta',

  groom: {
    fullName: 'Yusuf Rahman, S.T.',
    nickname: 'Yusuf',
    title: 'The Groom',
    parents: 'Son of Mr. Ahmad Rahman & Mrs. Siti Aminah',
    bio: 'A quiet engineer with a loud laugh. He believes the best conversations happen over a second cup of coffee.',
    photo: '/images/groom.png',
    instagram: 'https://instagram.com/yusuf.example',
  } satisfies Person,

  bride: {
    fullName: 'Delila Putri, S.Pd.',
    nickname: 'Delila',
    title: 'The Bride',
    parents: 'Daughter of Mr. Hasan Basri & Mrs. Nur Laila',
    bio: 'A teacher with a gentle heart and a notebook full of plans. She finds beauty in small, ordinary mornings.',
    photo: '/images/bride.png',
    instagram: 'https://instagram.com/delila.example',
  } satisfies Person,

  cover: {
    image: '/images/cover.png',
    eyebrow: 'The Wedding Of',
    openLabel: 'Open Invitation',
  },

  opening: {
    verse:
      'And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them.',
    verseSource: 'Ar-Rum 30:21',
    message:
      'With joy and gratitude, together with our families, we invite you to celebrate the beginning of our life together.',
  },

  /** Countdown target is the first event's start time. */
  events: [
    {
      id: 'akad',
      title: 'Akad Nikah',
      start: '2027-03-20T08:00:00+07:00',
      timeLabel: '08:00 - 10:00 WIB',
      note: 'The solemnization ceremony, attended by close family.',
    },
    {
      id: 'reception',
      title: 'Wedding Reception',
      start: '2027-03-20T11:00:00+07:00',
      timeLabel: '11:00 - 14:00 WIB',
      note: 'Lunch reception. Please arrive on time and dress in soft, earthy tones.',
    },
  ] satisfies WeddingEvent[],

  venue: {
    name: 'Taman Asri Garden Hall',
    address: 'Jl. Melati No. 12, Menteng, Jakarta Pusat 10310, Indonesia',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Menteng+Jakarta+Pusat',
    mapsEmbedUrl: 'https://www.google.com/maps?q=Menteng+Jakarta+Pusat&output=embed',
  },

  story: [
    {
      year: '2018',
      title: 'First Meeting',
      text: 'We met at a friend’s study group. One borrowed pen and an awkward hello turned into hours of talking.',
    },
    {
      year: '2021',
      title: 'Growing Together',
      text: 'Through long distance, late-night calls, and shared dreams, we learned that home is a person.',
    },
    {
      year: '2025',
      title: 'The Proposal',
      text: 'On a quiet evening with both families gathered, a simple question received the easiest yes.',
    },
    {
      year: '2027',
      title: 'Forever Begins',
      text: 'We are ready to start our greatest chapter, and we would love for you to be part of it.',
    },
  ],

  gallery: [
    { src: '/images/gallery-1.png', alt: 'The couple walking together in a garden', ratio: 'portrait' },
    { src: '/images/gallery-2.png', alt: 'The couple sharing a quiet moment', ratio: 'landscape' },
    { src: '/images/gallery-3.png', alt: 'Hands joined with wedding rings', ratio: 'landscape' },
    { src: '/images/gallery-4.png', alt: 'The couple laughing under soft light', ratio: 'portrait' },
  ] as { src: string; alt: string; ratio: 'portrait' | 'landscape' }[],

  /** Set to null to hide the wedding gift section. */
  gift: {
    message:
      'Your presence is the greatest gift. Should you wish to honor us with a gift, you may send it digitally.',
    accounts: [
      { bank: 'Bank Central Asia (BCA)', number: '1234567890', holder: 'Yusuf Rahman' },
      { bank: 'Bank Mandiri', number: '0987654321', holder: 'Delila Putri' },
    ],
    address: 'Jl. Kenanga No. 5, Jakarta Selatan 12140',
  } as {
    message: string
    accounts: { bank: string; number: string; holder: string }[]
    address?: string
  } | null,

  music: {
    src: '/audio/wedding-theme.wav',
    title: 'Wedding theme',
  },

  closing: {
    message:
      'It is an honor to have you share our happiness. Your prayers and presence will make our day complete.',
    signoff: 'With love,',
    names: 'Yusuf & Delila',
    family: 'Along with the Rahman and Basri families',
  },

  social: [
    { label: 'Yusuf on Instagram', href: 'https://instagram.com/yusuf.example' },
    { label: 'Delila on Instagram', href: 'https://instagram.com/delila.example' },
  ],

  /** Prefilled WhatsApp message used by the admin share button. {name} and {url} are replaced. */
  whatsappTemplate:
    'Assalamu’alaikum {name},\n\nWith joy, we invite you to the wedding of Yusuf & Delila. Please open your personal invitation here:\n{url}\n\nThank you, and we hope to see you there.',
} as const

export const weddingStart = new Date(wedding.events[0].start)

export const maxWishLength = 500
export const maxRsvpNoteLength = 500
