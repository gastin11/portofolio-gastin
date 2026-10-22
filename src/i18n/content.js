/**
 * Seluruh konten halaman dalam dua bahasa (ID default, EN opsional).
 * Bahasa asli (Indonesia) == konten placeholder di HTML sumber.
 */

// Statement seksi "Tentang": segmen dengan kelas opsional (g = abu redup, em = lime serif italic)
const statementId = [
  { t: 'Kode bukan sekadar fungsi, ' },
  { t: 'tapi', c: 'g' },
  { t: ' ' },
  { t: 'pengalaman', em: true },
  { t: ' yang ' },
  { t: 'terasa', c: 'g' },
  { t: ' rapi dan manusiawi.' },
]
const statementEn = [
  { t: 'Code is not just function, ' },
  { t: 'but', c: 'g' },
  { t: ' an ' },
  { t: 'experience', em: true },
  { t: ' that ' },
  { t: 'feels', c: 'g' },
  { t: ' tidy and human.' },
]

export const content = {
  id: {
    nav: {
      menu: ['[ Tentang ]', '[ Karya ]', '[ Layanan ]'],
      contact: 'Hubungi ↗',
      switchLabel: 'Ganti bahasa / Switch language',
    },
    hero: {
      hello: 'Halo',
      comma: ',',
      im: 'saya',
      first: 'Gastin',
      last: 'Alfiansa',
      role: 'Full-stack Developer · System Design · AI & Otomasi',
      desc: 'Saya merancang dan mengembangkan aplikasi web, mengintegrasikan kemampuan berbasis AI, dan mengubah kebutuhan bisnis menjadi solusi digital yang praktis.',
      ctaWork: 'Lihat Proyek ↗',
      ctaCv: 'Lihat CV ↗',
      hint: 'SCROLL ↓',
      cvHref: 'cv/Gastin-Alfiansa-CV.pdf',
    },
    about: {
      label: '[ 01 — TENTANG ]',
      statement: statementId,
      cols: [
        { label: 'FILOSOFI', text: 'Kejelasan di atas kerumitan. Setiap elemen punya alasan, setiap baris punya tujuan.' },
        { label: 'PENDEKATAN', text: 'Sistem yang kuat di balik layar, tampilan yang bersih dan tipografi yang berkarakter di depan layar.' },
        { label: 'STACK', text: 'Laravel · React · Vite · Tailwind CSS · GSAP · Framer Motion · Three.js' },
      ],
    },
    work: {
      label: '[ 02 — KARYA TERPILIH ]',
      heading: 'Recent',
      headingAccent: 'works',
      projects: [
        { cls: 'p1', no: '01', tags: ['Laravel', 'HR System'], title: ['HR Management', 'System'], href: '#' },
        { cls: 'p2', no: '02', tags: ['Landing page', 'Agency'], title: ['Sitezet', 'Company Profile'], href: '#' },
        { cls: 'p3', no: '03', tags: ['Game web', 'Narasi'], title: ['A Little Walk'], href: '#' },
        { cls: 'p4', no: '04', tags: ['Pixel art', 'RPG'], title: ['Ksatria Bunga'], href: '#' },
      ],
    },
    services: {
      label: '[ 03 — LAYANAN ]',
      heading: 'Services',
      items: [
        { num: '01', title: 'Web Development', desc: 'Website responsif, cepat, dan SEO-friendly.' },
        { num: '02', title: 'HR Systems', desc: 'Absensi, cuti, dan alur kerja HR kustom.' },
        { num: '03', title: 'UI Engineering', desc: 'Desain jadi kode dengan animasi halus.' },
        { num: '04', title: 'Konsultasi', desc: 'Arsitektur, performa, dan code review.' },
      ],
    },
    contact: {
      label: '[ MARI BEKERJA SAMA ]',
      heading: 'Great code',
      headingAccent: 'starts with',
      headingEnd: 'great collaboration',
      email: 'hello@gastin.dev ↗',
      mailto: 'mailto:hello@gastin.dev',
    },
    thanks: {
      title: 'Thank you',
      copy: '© 2026 Gastin Alfiansa · Indonesia',
    },
    tabs: {
      home: 'Beranda',
      about: 'Tentang',
      work: 'Karya',
      services: 'Layanan',
      contact: 'Kontak',
      switchLabel: 'Ganti bahasa / Switch language',
    },
  },
  en: {
    nav: {
      menu: ['[ About ]', '[ Work ]', '[ Services ]'],
      contact: 'Contact ↗',
      switchLabel: 'Switch language / Ganti bahasa',
    },
    hero: {
      hello: 'Hello',
      comma: ',',
      im: "I'm",
      first: 'Gastin',
      last: 'Alfiansa',
      role: 'Full-stack Developer · System Design · AI & Automation',
      desc: 'I design and develop web applications, integrate AI-powered capabilities, and turn business requirements into practical digital solutions.',
      ctaWork: 'Explore Projects ↗',
      ctaCv: 'View CV ↗',
      hint: 'SCROLL ↓',
      cvHref: 'cv/Gastin-Alfiansa-CV.pdf',
    },
    about: {
      label: '[ 01 — ABOUT ]',
      statement: statementEn,
      cols: [
        { label: 'PHILOSOPHY', text: 'Clarity over complexity. Every element has a reason, every line has a purpose.' },
        { label: 'APPROACH', text: 'Strong systems behind the scenes, a clean interface and characterful typography up front.' },
        { label: 'STACK', text: 'Laravel · React · Vite · Tailwind CSS · GSAP · Framer Motion · Three.js' },
      ],
    },
    work: {
      label: '[ 02 — SELECTED WORK ]',
      heading: 'Recent',
      headingAccent: 'works',
      projects: [
        { cls: 'p1', no: '01', tags: ['Laravel', 'HR System'], title: ['HR Management', 'System'], href: '#' },
        { cls: 'p2', no: '02', tags: ['Landing page', 'Agency'], title: ['Sitezet', 'Company Profile'], href: '#' },
        { cls: 'p3', no: '03', tags: ['Game web', 'Narrative'], title: ['A Little Walk'], href: '#' },
        { cls: 'p4', no: '04', tags: ['Pixel art', 'RPG'], title: ['Ksatria Bunga'], href: '#' },
      ],
    },
    services: {
      label: '[ 03 — SERVICES ]',
      heading: 'Services',
      items: [
        { num: '01', title: 'Web Development', desc: 'Responsive, fast, SEO-friendly websites.' },
        { num: '02', title: 'HR Systems', desc: 'Custom attendance, leave, and HR workflows.' },
        { num: '03', title: 'UI Engineering', desc: 'Designs turned into code with smooth animation.' },
        { num: '04', title: 'Consulting', desc: 'Architecture, performance, and code review.' },
      ],
    },
    contact: {
      label: "[ LET'S WORK TOGETHER ]",
      heading: 'Great code',
      headingAccent: 'starts with',
      headingEnd: 'great collaboration',
      email: 'hello@gastin.dev ↗',
      mailto: 'mailto:hello@gastin.dev',
    },
    thanks: {
      title: 'Thank you',
      copy: '© 2026 Gastin Alfiansa · Indonesia',
    },
    tabs: {
      home: 'Home',
      about: 'About',
      work: 'Work',
      services: 'Services',
      contact: 'Contact',
      switchLabel: 'Switch language / Ganti bahasa',
    },
  },
}
