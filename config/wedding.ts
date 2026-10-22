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
}

export const wedding = {
  slug: 'wedding',
  timezone: 'Asia/Makassar',

  groom: {
    fullName: 'Syarifuddin',
    nickname: 'Uddin',
    title: 'Pengantin Pria',
    parents: 'Anak ke-2 dari Bapak Sattu (alm) & Ibu Hamo',
    photo: '/images/groom.png',
    instagram: 'https://instagram.com/yusuf.example',
  } satisfies Person,

  bride: {
    fullName: 'Tri Rahyu Ramadhanni. R, S.S',
    nickname: 'Dhanny',
    title: 'Pengantin Wanita',
    parents: 'Anak bungsu dari 3 bersaudara, anak Bapak Ramli Thaha & Ibu Suryati',
    photo: '/images/bride.png',
    instagram: 'https://instagram.com/delila.example',
  } satisfies Person,

  cover: {
    image: '/images/cover.jpg',
    eyebrow: 'The Wedding Of',
    openLabel: 'Open Invitation',
  },

  opening: {
    verse:
      'Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
    verseSource: 'Ar-Rum 30:21',
    message:
      'Dengan sukacita dan rasa syukur, bersama keluarga kami, kami mengundang Anda untuk merayakan awal kehidupan kami bersama.',
  },

  /** Countdown target is the first event's start time. */
  events: [
    {
      id: 'akad',
      title: 'Akad Nikah',
      start: '2026-10-31T10:00:00+08:00',
      timeLabel: '10:00 - Selesai WITA',
    },
    {
      id: 'walimah',
      title: 'Walimah',
      start: '2026-10-31T10:00:00+08:00',
      timeLabel: '11:00 - Selesai WITA',
    },
  ] satisfies WeddingEvent[],

  venue: {
    name: 'Perumahan Barombong Permai',
    address: 'Jln. Abd. Kuddus Perum Barombong Permai no. C2, Bontoa, Kel. Barombong, Kec. Tamalate, Makassar',
    mapsUrl: 'https://maps.app.goo.gl/QxRokkkduHDbUVqr8',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d496.6657056022668!2d119.39334587669063!3d-5.211423227643377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbf1ddd901477db%3A0xcbfc991a74d2d6fd!2sBarombong%20Permai!5e0!3m2!1sid!2sid!4v1792515684096!5m2!1sid!2sid',
  },

  story: [
    {
      id: '1',
      title: 'Pertemuan Pertama',
      text: 'Meminta pemilik hati dan sang maha pemberi rizki dan jodoh.',
      // text: 'Terjadi secara singkat saja, diawali dengan dikenalkan oleh sang anak dari pengantin pria di sebuah cafe yang secara singkat bercerita tentang pengalaman kegagalan berumah tangga.',
    },
    {
      id: '2',
      title: 'Pertemuan Kedua',
      text: 'Melakukan Ikhtiar.',
      // text: 'Setelah pertemuan pertama tersebut, selanjutnya disusul dengan 2x pertemuan untuk berbicara tentang visi misi pernikahan dan menentukan untuk berkomitmen.',
    },
    {
      id: '3',
      title: 'Pertemuan Ketiga',
      text: 'Berjodoh dengan berkomitmen bersama menjalankan biduk rumah tangga.',
      // text: 'Bertemu secara pribadi dengan keluarga inti pekan selanjutnya untuk pelamaran dengan melibatkan keluarga besar.',
    },
  ],

  /** Set to null to hide the wedding gift section. */
  gift: {
    message:
      'Kehadiran Anda adalah anugerah terbesar. Jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya secara digital..',
    accounts: [
      { bank: 'Bank Syariah Indonesia', number: '7069129522', holder: 'Tri Rahayu' },
    ],
    address: 'Jln. Abd. Kuddus Perum Barombong Permai no. C2, Bontoa, Kel. Barombong, Kec. Tamalate, Makassar',
  } as {
    message: string
    accounts: { bank: string; number: string; holder: string }[]
    address?: string
  } | null,

  music: {
    src: '/audio/istikharah-cinta.mp3',
    title: 'Wedding theme',
  },

  closing: {
    message:
      'Merupakan suatu kehormatan bagi kami atas kehadiran Anda untuk turut berbagi kebahagiaan ini. Doa dan kehadiran Anda akan menyempurnakan hari kami.',
    signoff: 'With love,',
    names: 'Uddin & Dhanny',
    family: 'Bersama keluarga besar kedua mempelai',
  },

  social: [
    { label: 'Uddin on Instagram', href: 'https://instagram.com/yusuf.example' },
    { label: 'Dhanny on Instagram', href: 'https://instagram.com/delila.example' },
  ],

  /** Prefilled WhatsApp message used by the admin share button. {name} and {url} are replaced. */
  whatsappTemplate:
    'Assalamu’alaikum Warahmatullahi Wabarakatuh. {name},\n\nSegala puji bagi Allah SWT yang telah menciptakan makhluknya berpasang-pasangan. Dengan penuh rasa hormat perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami. \nInformasi lengkap acara kami cantumkan melalui link berikut dan diharapkan untuk konfirmasi kehadirannya dengan mengisi form yang telah disediakan:\n{url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i untuk berkenan hadir serta memberikan doa dan restu. \n\nSemoga Allah memberkahi dan menghimpunkan kami dalam kebaikan dunia dan akhirat. Aamiin.\n\nWassalamu’alaikum Warahmatullahi Wabarakatuh. Kami yang berbahagia,\n\nUddin & Dhanny',
} as const

export const weddingStart = new Date(wedding.events[0].start)

export const maxWishLength = 500
export const maxRsvpNoteLength = 500
