import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext.jsx'
import { clamp01, reducedMotion } from '../motion/gsap.js'

/**
 * Grid "Recent works" — 4 kartu warna solid dengan efek 3D flip saat diklik:
 * - Sisi depan (.pc-front): nomor, tag, kotak preview 16:10, judul Anton, dan tombol pill Flip.
 * - Sisi belakang (.pc-back): judul, deskripsi ringkas proyek, dan poin fitur utama.
 * - Transisi masuk (Under-Curtain Slide): seluruh isi seksi Project (ke-4 kartu + judul seksi)
 *   bergeser keluar dari kolong tirai gelap #about tanpa efek pudar/tenggelam, diawali kartu
 *   paling bawah hingga diikuti judul seksi (dan seluruhnya masuk kembali ke bawah #about saat reverse).
 */
const CARD = {
  p1: {
    span: 'md:col-span-7',
    tone: 'bg-pri text-white',
    shot: 'border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.14)]',
    backBox: 'border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.1)]',
    tag: 'border-white',
    flipBtn:
      'border-white/75 bg-white/15 text-white group-hover:bg-white group-hover:text-pri',
    divider: 'border-[rgba(255,255,255,0.22)]',
  },
  p2: {
    span: 'md:col-span-5',
    tone: 'bg-lime text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    backBox: 'border-[rgba(16,16,16,0.22)] bg-[rgba(255,255,255,0.38)]',
    tag: 'border-[#101010]',
    flipBtn:
      'border-[#101010] bg-[#101010]/10 text-[#101010] group-hover:bg-[#101010] group-hover:text-lime',
    divider: 'border-[rgba(16,16,16,0.18)]',
  },
  p3: {
    span: 'md:col-span-5',
    tone: 'bg-lilac text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    backBox: 'border-[rgba(16,16,16,0.22)] bg-[rgba(255,255,255,0.36)]',
    tag: 'border-[#101010]',
    flipBtn:
      'border-[#101010] bg-[#101010]/10 text-[#101010] group-hover:bg-[#101010] group-hover:text-lilac',
    divider: 'border-[rgba(16,16,16,0.18)]',
  },
  p4: {
    span: 'md:col-span-7',
    tone: 'bg-peach text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    backBox: 'border-[rgba(16,16,16,0.22)] bg-[rgba(255,255,255,0.36)]',
    tag: 'border-[#101010]',
    flipBtn:
      'border-[#101010] bg-[#101010]/10 text-[#101010] group-hover:bg-[#101010] group-hover:text-peach',
    divider: 'border-[rgba(16,16,16,0.18)]',
  },
}

function FlipIcon() {
  return (
    <svg
      className="pc-flip-ico h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

export default function Work() {
  const { t } = useLang()
  const [flippedMap, setFlippedMap] = useState({})
  const secRef = useRef(null)
  const headRef = useRef(null)

  const toggleFlip = (cls) => {
    setFlippedMap((prev) => ({
      ...prev,
      [cls]: !prev[cls],
    }))
  }

  const onKeyToggle = (e, cls) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlip(cls)
    }
  }

  // Transisi About → Work (Under-Curtain Reveal seperti seksi akhir ThankYou):
  // Menggunakan rumus ease-out kubik `1 - Math.pow(1 - p, 3)` + translateY dari bawah
  // seperti ThankYou.jsx. Saat #about naik menyingkap #work, judul seksi muncul lebih dulu
  // dari bawah #about, diikuti oleh kartu-kartu proyek (dan saat reverse scroll, kartu
  // turun/kembali lebih dulu lalu diikuti judul masuk kembali ke bawah #about).
  useEffect(() => {
    const sec = secRef.current
    const head = headRef.current
    if (!sec || !head) return undefined
    const scenes = Array.from(sec.querySelectorAll('.pc-scene'))
    if (scenes.length < 4) return undefined

    const cards = scenes.map((s) => s.querySelector('.pc'))

    const clearStyles = () => {
      sec.style.clipPath = ''
      head.style.opacity = ''
      head.style.transform = ''
      scenes.forEach((s, i) => {
        s.style.transform = ''
        if (cards[i]) cards[i].style.opacity = ''
      })
    }

    const render = () => {
      if (reducedMotion()) {
        clearStyles()
        return
      }

      const vh = window.innerHeight
      const secRect = sec.getBoundingClientRect()

      // Seluruh isi seksi #work (ke-4 kartu proyek + judul seksi) bergeser keluar-masuk
      // dari kolong belakang tirai bawah #about (z-[4]) tanpa efek pudar (opacity) maupun
      // tenggelam (scale). Saat pSection = 0 (secRect.top = vh), seluruh tinggi konten #work
      // hingga kartu ke-4 berada tepat di balik batas bawah #about (shiftY = -contentBottom).
      // Seiring #about terangkat ke atas (pSection: 0 → 1), ke-4 kartu meluncur keluar
      // berurutan dari bawah #about diikuti judul seksi, dan saat reverse scroll seluruh
      // 4 kartu beserta judul meluncur masuk kembali ke bawah #about.
      if (secRect.top <= 0) {
        clearStyles()
        return
      }

      const about = document.getElementById('about')
      const startTop = about ? Math.min(vh, about.offsetHeight) : vh
      const lastScene = scenes[scenes.length - 1]
      const contentBottom = lastScene.offsetTop + lastScene.offsetHeight + 64
      const pSection = clamp01(1 - secRect.top / startTop)
      const shiftY = -(1 - pSection) * contentBottom
      const tx = `translate3d(0, ${shiftY.toFixed(1)}px, 0)`

      // Clip bagian atas seksi tepat di balik sudut membulat bawah #about (-48px)
      // agar saat digeser ke atas sejauh -contentBottom tidak pernah tembus di atas #about.
      sec.style.clipPath = 'inset(-48px -100px -200px -100px)'
      head.style.opacity = ''
      head.style.transform = tx

      scenes.forEach((scene, i) => {
        scene.style.transformOrigin = ''
        scene.style.transform = tx
        if (cards[i]) cards[i].style.opacity = ''
      })
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      clearStyles()
    }
  }, [t])

  return (
    <section
      ref={secRef}
      id="work"
      className="relative z-[3] mx-auto max-w-[1300px] px-7 pt-[90px] pb-[70px] max-md:px-5 max-md:pt-16 max-md:pb-12"
    >
      <div ref={headRef} className="relative origin-left will-change-transform">
        <small>{t.work.label}</small>
        <h2 className="disp">
          {t.work.heading}{' '}
          <span className="serif text-pri normal-case">{t.work.headingAccent}</span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-12 items-stretch gap-[18px]">
        {t.work.projects.map((p) => {
          const card = CARD[p.cls]
          const isFlipped = Boolean(flippedMap[p.cls])
          return (
            <div
              className={`pc-scene relative col-span-12 flex h-full flex-col will-change-transform ${card.span}`}
              key={p.cls}
            >
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                onClick={() => toggleFlip(p.cls)}
                onKeyDown={(e) => onKeyToggle(e, p.cls)}
                className={`pc ${p.cls} ${isFlipped ? 'is-flipped' : ''} group relative grid grid-rows-[minmax(0,1fr)] h-full min-h-[450px] w-full flex-1 cursor-pointer select-none max-md:h-[430px] max-md:min-h-[430px]`}
              >
                {/* SISI DEPAN KARTU */}
                <div
                  className={`pc-face pc-front col-start-1 row-start-1 flex h-full flex-col justify-between overflow-hidden rounded-pc p-7 max-md:rounded-[32px] max-md:p-[22px] ${card.tone} ${isFlipped ? 'pointer-events-none' : ''}`}
                >
                  <span className="absolute right-6 top-[18px] text-[12px]">{p.no}</span>
                  <small className="flex flex-wrap gap-1.5 pr-8">
                    {p.tags.map((tag) => (
                      <i
                        className={`rounded-pill border-[1.5px] px-[10px] py-px text-[11px] not-italic ${card.tag}`}
                        key={tag}
                      >
                        {tag}
                      </i>
                    ))}
                  </small>
                  <div
                    className={`shot relative my-[18px] grid min-h-[190px] flex-1 place-items-center overflow-hidden rounded-shot max-md:min-h-[160px] max-md:rounded-[22px] ${
                      p.image
                        ? ''
                        : `border-[1.5px] border-dashed ${card.shot}`
                    }`}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={Array.isArray(p.title) ? p.title.join(' ') : p.title}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.14em] opacity-[0.65]">
                        Preview 16:10
                      </span>
                    )}
                  </div>
                  <div className="relative flex w-full items-end justify-between gap-3 max-md:flex-col max-md:items-start max-md:gap-3">
                    <div className="disp flex min-h-[1.88em] min-w-0 flex-1 flex-col justify-end text-[clamp(24px,2.8vw,38px)] leading-[0.94] max-md:text-[clamp(24px,6.8vw,32px)]">
                      {p.title.map((line, i) => (
                        <span key={i} className="block whitespace-nowrap">
                          {line}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 text-[11px] font-bold tracking-[0.03em] transition-colors duration-200 md:absolute md:right-0 md:bottom-0 max-md:self-end max-md:px-3 max-md:py-1 max-md:text-[10.5px] ${card.flipBtn}`}
                    >
                      <FlipIcon />
                      <span>{t.work.flipHint}</span>
                    </span>
                  </div>
                </div>

                {/* SISI BELAKANG KARTU (DESKRIPSI PROYEK) */}
                <div
                  className={`pc-face pc-back col-start-1 row-start-1 flex h-full flex-col justify-between overflow-hidden rounded-pc p-7 max-md:rounded-[32px] max-md:p-[22px] ${card.tone} ${isFlipped ? '' : 'pointer-events-none'}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold tracking-[0.12em] opacity-80">
                        [ {t.work.summaryLabel} ]
                      </span>
                      <span className="text-[12px]">{p.no}</span>
                    </div>
                    <div className={`mt-3.5 border-b pb-3.5 max-md:mt-2.5 max-md:pb-2.5 ${card.divider}`}>
                      <div className="disp flex min-h-[1.9em] flex-col justify-end text-[clamp(24px,2.8vw,36px)] leading-[0.95] max-md:text-[clamp(22px,6.4vw,30px)]">
                        {p.title.map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`my-4 flex flex-1 flex-col justify-center rounded-shot border p-5 max-md:my-2.5 max-md:rounded-[20px] max-md:p-3.5 ${card.backBox}`}
                  >
                    <p className="text-[13.5px] leading-[1.68] max-md:text-[12px] max-md:leading-[1.5]">
                      {p.desc}
                    </p>
                    {p.highlights && (
                      <ul className="mt-3.5 space-y-1.5 text-[12px] leading-[1.45] opacity-90 max-md:mt-2 max-md:space-y-1 max-md:text-[11px]">
                        {p.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span aria-hidden="true">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <small className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <i
                          className={`rounded-pill border-[1.5px] px-[10px] py-px text-[11px] not-italic max-md:px-2 max-md:text-[10px] ${card.tag}`}
                          key={tag}
                        >
                          {tag}
                        </i>
                      ))}
                    </small>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border-[1.5px] px-3 py-1.5 text-[11px] font-bold tracking-[0.03em] transition-colors duration-200 max-md:ml-auto max-md:px-3 max-md:py-1 max-md:text-[10.5px] ${card.flipBtn}`}
                    >
                      <FlipIcon />
                      <span>{t.work.backHint}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
