import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext.jsx'
import { navigateToSection } from '../motion/navScroll.js'
import CvModal from './CvModal.jsx'

/**
 * Ikon SVG kustom untuk ketiga stiker pita hero:
 * - starburst: bintang 14 sudut solid (inspirasi ref #1)
 * - star5: bintang 5 sudut solid (inspirasi ref #2)
 * - codeFrame: jendela kode miring line-art untuk Full-stack Developer
 * - nodeBulb: bohlam/simpul arsitektur berpendar line-art untuk System Design (inspirasi ref #2)
 * - orbitCog: roda gigi bercincin orbit line-art untuk AI & Otomasi (inspirasi ref #3)
 */
const StickerIcons = {
  starburst: (
    <svg className="stk-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1l2.1 6.2 5.4-3.7-2.6 6 6.5-.4-5.1 4.1 5.7 3.2-6.5.9 3.4 5.6-5.7-3.2-.2 6.3-2.5-6-4.7 4.5 1.1-6.4-6.4 1.4 4.3-4.9-5.9-2.8 6.3-1.6-3.7-5.4 5.9 2.8L12 1z"
      />
    </svg>
  ),
  star5: (
    <svg className="stk-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.1 6 20.5l1.3-6.7-5-4.6 6.8-.8L12 2.2z"
      />
    </svg>
  ),
  codeFrame: (
    <svg className="stk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="rotate(-8 12 12)">
        <rect x="2.5" y="4" width="19" height="16" rx="3" />
        <line x1="2.5" y1="8.5" x2="21.5" y2="8.5" />
        <path d="M9.5 12l-2.5 2.2 2.5 2.2" />
        <path d="M14.5 12l2.5 2.2-2.5 2.2" />
        <line x1="12.8" y1="11.5" x2="11.2" y2="16.9" />
      </g>
    </svg>
  ),
  nodeBulb: (
    <svg className="stk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="rotate(10 12 12)">
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8.2 14.2A5.5 5.5 0 1 1 15.8 14.2c-.7.6-1.3 1.5-1.5 2.3H9.7c-.2-.8-.8-1.7-1.5-2.3z" />
        <line x1="12" y1="1.5" x2="12" y2="3.2" />
        <line x1="4.2" y1="4.8" x2="5.5" y2="6" />
        <line x1="19.8" y1="4.8" x2="18.5" y2="6" />
      </g>
    </svg>
  ),
  orbitCog: (
    <svg className="stk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" strokeDasharray="2.2 1.8" />
      <ellipse cx="12" cy="12" rx="10.2" ry="4.2" transform="rotate(-16 12 12)" />
    </svg>
  ),
}

// Konfigurasi sudut kemiringan dasar & arah rotasi scroll untuk 3 stiker
const STICKER_POSE = [
  { baseRot: -7, entryRot: -18, drift: -3.5 },
  { baseRot: 6, entryRot: 17, drift: 3.5 },
  { baseRot: -4.5, entryRot: 8, drift: -2.5 },
]

/**
 * Hero scrollytelling — wrapper 460vh berisi panel sticky.
 * Progres scroll (0–1) menggerakkan: kata "Halo / saya / Gastin / Alfiansa"
 * muncul bertahap, foto pindah ke slot di kanan nama, 3 stiker peran
 * (Full-stack Developer, System Design, AI & Otomasi) muncul + berotasi
 * mengelilingi headline, quote diketik huruf demi huruf mengikuti scroll
 * (0.46 → 0.72), tetap diam penuh saat tombol muncul (0.72 → 0.84),
 * dan baru melakukan looping typing huruf demi huruf saat benar-benar
 * mencapai akhir hero (p >= 0.84, setara posisi setelah klik SCROLL ↓).
 */
export default function Hero() {
  const { lang, t } = useLang()
  const [isCvOpen, setIsCvOpen] = useState(false)
  const wrapRef = useRef(null)
  const boxRef = useRef(null)
  const h1Ref = useRef(null)
  const l2Ref = useRef(null)
  const bioRef = useRef(null)
  const descBoxRef = useRef(null)
  const startRef = useRef(null)
  const slotRef = useRef(null)
  const picRef = useRef(null)
  const imgHeroRef = useRef(null)
  const imgAboutRef = useRef(null)
  const hintRef = useRef(null)

  const quoteWords = t.hero.desc.split(' ')

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const box = boxRef.current
    const h1 = h1Ref.current
    const l2 = l2Ref.current
    const bio = bioRef.current
    const descBox = descBoxRef.current
    const start = startRef.current
    const slot = slotRef.current
    const pic = picRef.current
    const imgHero = imgHeroRef.current
    const imgAbout = imgAboutRef.current
    const hint = hintRef.current
    if (!wrap || !box || !h1) return undefined

    const words = Array.from(h1.querySelectorAll('.w'))
    const stickers = Array.from(box.querySelectorAll('.stk'))
    const spans = Array.from(bio.querySelectorAll('.b'))
    const red = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nat = []

    let looping = false
    let visibleChars = 0

    // Bersihkan timer lama yang mungkin tertinggal dari HMR sebelumnya
    if (window.__heroQuoteTimer) {
      clearTimeout(window.__heroQuoteTimer)
      window.__heroQuoteTimer = null
    }
    window.__heroQuoteGen = (window.__heroQuoteGen || 0) + 1

    // Menampilkan `count` karakter pertama pada quote tanpa menggeser layout,
    // dan menempelkan kursor `|` pada karakter terakhir yang sedang tampil.
    const setVisibleChars = (count) => {
      if (!descBox) return
      const chars = descBox.querySelectorAll('.q-char')
      const totalChars = chars.length
      const clamped = Math.max(0, Math.min(totalChars, count))
      visibleChars = clamped
      chars.forEach((el, idx) => {
        const shown = idx < clamped
        el.style.opacity = shown ? '1' : '0'
        if (idx === clamped - 1 && clamped > 0) {
          el.dataset.caret = 'true'
        } else {
          delete el.dataset.caret
        }
      })
    }

    const stopLoop = () => {
      window.__heroQuoteGen = (window.__heroQuoteGen || 0) + 1
      if (window.__heroQuoteTimer) {
        clearTimeout(window.__heroQuoteTimer)
        window.__heroQuoteTimer = null
      }
      looping = false
    }

    const tickLoop = (gen) => {
      if (!looping || gen !== window.__heroQuoteGen || !descBox || !descBox.isConnected) return
      const chars = descBox.querySelectorAll('.q-char')
      const totalChars = chars.length
      if (totalChars === 0) return

      if (visibleChars < totalChars) {
        const nextCount = visibleChars + 1
        setVisibleChars(nextCount)
        const currentChar = chars[nextCount - 1]?.textContent || ''
        const isLastChar = nextCount >= totalChars
        const delay = isLastChar ? 1700 : currentChar === '.' ? 300 : 45
        window.__heroQuoteTimer = setTimeout(() => tickLoop(gen), delay)
      } else {
        // Setelah selesai sampai huruf terakhir, ketik ulang mulai dari huruf pertama
        setVisibleChars(1)
        window.__heroQuoteTimer = setTimeout(() => tickLoop(gen), 60)
      }
    }

    const startLoop = () => {
      if (looping || red || !descBox) return
      const totalChars = descBox.querySelectorAll('.q-char').length
      if (totalChars === 0) return
      window.__heroQuoteGen = (window.__heroQuoteGen || 0) + 1
      const gen = window.__heroQuoteGen
      if (window.__heroQuoteTimer) {
        clearTimeout(window.__heroQuoteTimer)
        window.__heroQuoteTimer = null
      }
      looping = true
      setVisibleChars(totalChars)
      window.__heroQuoteTimer = setTimeout(() => tickLoop(gen), 1100)
    }

    const c = (v) => Math.min(1, Math.max(0, v))
    const ez = (x) => 1 - Math.pow(1 - x, 3)
    const seg = (p, a, b) => c((p - a) / (b - a))

    const measure = () => {
      words.forEach((w, i) => {
        w.style.maxWidth = 'none'
        nat[i] = w.scrollWidth + 2
      })
      render()
    }

    const render = () => {
      if (!wrap || !box) return
      const r = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      const p = red ? 1 : c(-r.top / total)
      const fs = parseFloat(getComputedStyle(h1).fontSize)

      // Kompensasi tengah komposisi awal: setengah dari tinggi konten
      // yang masih tersembunyi (baris nama kedua + blok bio).
      const hid = l2.offsetHeight + bio.offsetHeight
      box.style.paddingTop = `${(hid / 2) * (1 - seg(p, 0.02, 0.85))}px`

      words.forEach((w, i) => {
        const k = Number(w.dataset.k)
        const g = Number(w.dataset.g || 0)
        const tt = k === 0 ? 1 : ez(seg(p, 0.03 + (k - 1) * 0.07, 0.12 + (k - 1) * 0.07))
        w.style.opacity = tt
        if (k > 0 && nat[i]) w.style.maxWidth = `${nat[i] * tt}px`
        w.style.marginLeft = `${g * fs * tt}px`
        w.style.transform = `translateY(${(1 - tt) * 26}px)`
      })

      const S = Math.round(fs * 0.9)
      const A = 140
      const e1 = ez(seg(p, 0.12, 0.4))
      start.style.height = `${A * (1 - e1)}px`
      start.style.marginBottom = `${18 * (1 - e1)}px`

      slot.style.width = `${S * e1}px`
      slot.style.marginLeft = `${0.3 * fs * e1}px`
      slot.style.height = `${S}px`

      const sr = start.getBoundingClientRect()
      const tr = slot.getBoundingClientRect()
      const sx = sr.left + sr.width / 2
      const sy = sr.top + sr.height / 2
      const tx = tr.left + tr.width / 2
      const ty = tr.top + tr.height / 2
      const heroSize = A + (S - A) * e1
      const heroX = sx + (tx - sx) * e1
      const heroY = sy + (ty - sy) * e1

      const isMobile = window.matchMedia('(max-width: 820px)').matches
      const endP = 0.84
      const photoStartP = isMobile ? 0.86 : 0.9

      // Tahap 2: Saat scroll melewati akhir Hero menuju seksi #about, foto lingkaran
      // bergerak mulus dari slot di Hero menuju #about-photo-slot.
      const aboutSlot = document.getElementById('about-photo-slot')
      const aboutImg = document.getElementById('about-photo-img')
      let size = heroSize
      let x = heroX
      let y = heroY
      let e2 = 0
      let hidePic = false

      if (aboutSlot && p > photoStartP) {
        const ar = aboutSlot.getBoundingClientRect()
        const vh = window.innerHeight
        const startMorphY = vh * 0.96
        const endMorphY = vh * 0.46
        const raw2 = c((startMorphY - ar.top) / (startMorphY - endMorphY))
        // Smoothstep (ease-in-out) agar lepas & mendarat tanpa sentakan
        e2 = raw2 * raw2 * (3 - 2 * raw2)

        const ax = ar.left + ar.width / 2
        const ay = ar.top + ar.height / 2
        size = heroSize + (ar.width - heroSize) * e2
        x = heroX + (ax - heroX) * e2
        y = heroY + (ay - heroY) * e2
        hidePic = ar.bottom < -40
      }

      // Kunci foto saat telah mendarat di About (e2 >= 0.999).
      // Foto diserahkan ke elemen statis dokumen (#about-photo-img) sehingga saat scroll
      // naik-turun di About foto tetap diam di tempatnya (stay) tanpa efek membal/jitter.
      // Saat scroll kembali ke Hero (reverse), foto statis disembunyikan dan morph aktif kembali.
      const isDockedInAbout = e2 >= 0.999

      if (aboutSlot) {
        aboutSlot.style.boxShadow = isDockedInAbout
          ? '0 0 0 5px #101014, 0 0 0 6.5px rgba(246, 241, 231, 0.45)'
          : 'none'
      }
      if (aboutImg) {
        aboutImg.style.opacity = isDockedInAbout ? '1' : '0'
      }

      if (pic) {
        pic.style.visibility = (hidePic || isDockedInAbout) ? 'hidden' : 'visible'
        pic.style.width = `${size}px`
        pic.style.borderRadius = '50%'
        pic.style.boxShadow =
          e2 < 0.5
            ? '0 0 0 5px var(--bg), 0 0 0 6.5px var(--ink)'
            : '0 0 0 5px #101014, 0 0 0 6.5px rgba(246, 241, 231, 0.45)'
        pic.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`
      }
      if (imgHero) {
        imgHero.style.opacity = String(1 - e2)
        imgHero.style.transform = `scale(${1 + 0.08 * e2})`
      }
      if (imgAbout) {
        imgAbout.style.opacity = String(e2)
        imgAbout.style.transform = `scale(${1.08 - 0.08 * e2})`
      }

      // Ketiga stiker pita muncul & berotasi mengikuti progres scroll
      stickers.forEach((el, i) => {
        const pose = STICKER_POSE[i] || STICKER_POSE[0]
        const st = ez(seg(p, 0.3 + i * 0.07, 0.43 + i * 0.07))
        const drift = seg(p, 0.43 + i * 0.05, 1) * pose.drift
        const rot = pose.entryRot + (pose.baseRot - pose.entryRot) * st + drift
        const sc = 0.74 + 0.26 * st
        const tySt = (1 - st) * 16
        el.style.opacity = st
        el.style.filter = `blur(${(1 - st) * 4}px)`
        el.style.transform = `translateY(${tySt}px) scale(${sc}) rotate(${rot}deg)`
        el.style.pointerEvents = st > 0.6 ? 'auto' : 'none'
      })

      bio.style.borderTopColor = `rgba(128,128,128,${0.22 * seg(p, 0.42, 0.5)})`

      // Tombol muncul di rentang p = 0.70 → 0.82 (tuntas sebelum p = endP 0.84)
      spans.forEach((el, i) => {
        const st = ez(seg(p, 0.7 + i * 0.08, 0.82 + i * 0.08))
        el.style.opacity = st
        el.style.filter = `blur(${(1 - st) * 5}px)`
        el.style.transform = `translateY(${(1 - st) * 14}px)`
        el.style.pointerEvents = st > 0.6 ? 'auto' : 'none'
      })

      // Animasi typing huruf demi huruf:
      // - p < 0.46: tersembunyi penuh di awal hero.
      // - 0.46 <= p < 0.72: diketik huruf demi huruf mengikuti scroll.
      // - 0.72 <= p < 0.84: teks quote tampil penuh selagi tombol CTA muncul (belum looping).
      // - p >= 0.84: benar-benar di akhir hero section dan seterusnya ke bawah → looping typing.
      if (descBox) {
        const totalChars = descBox.querySelectorAll('.q-char').length
        if (red) {
          descBox.style.visibility = 'visible'
          descBox.style.opacity = '1'
          setVisibleChars(totalChars)
        } else if (p < 0.46) {
          stopLoop()
          descBox.style.opacity = '0'
          descBox.style.visibility = 'hidden'
          setVisibleChars(0)
        } else if (p < endP) {
          stopLoop()
          descBox.style.visibility = 'visible'
          descBox.style.opacity = String(ez(seg(p, 0.46, 0.52)))
          const tp = seg(p, 0.46, 0.72)
          setVisibleChars(Math.max(1, Math.round(tp * totalChars)))
        } else {
          descBox.style.visibility = 'visible'
          descBox.style.opacity = '1'
          startLoop()
        }
      }

      hint.style.opacity = 1 - seg(p, 0, 0.06)
    }

    const onScroll = () => render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)

    return () => {
      stopLoop()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [lang, t.hero.desc])

  /** Klik "SCROLL ↓" → lompat ke titik hero dengan seluruh konten tampil penuh
   *  (progres p ≈ 0.88: semua elemen sudah muncul & animasi looping aktif).
   *  Memakai requestAnimationFrame + behavior:'instant' agar tidak terputus di
   *  tengah jalan pada browser mobile akibat resize address-bar atau batas smooth-scroll. */
  const jumpToFull = () => {
    const wrap = wrapRef.current
    if (!wrap) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const getTargetY = () => {
      const isMobile = window.matchMedia('(max-width: 820px)').matches
      const ratio = isMobile ? 0.85 : 0.88
      const total = wrap.offsetHeight - window.innerHeight
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
      return Math.round(wrapTop + total * ratio)
    }

    if (reduce) {
      window.scrollTo({ top: getTargetY(), behavior: 'instant' })
      return
    }

    const startY = window.scrollY
    const duration = 680
    const startTime = performance.now()
    let cancelled = false

    const cancel = () => {
      cancelled = true
    }
    window.addEventListener('wheel', cancel, { passive: true, once: true })
    window.addEventListener('touchstart', cancel, { passive: true, once: true })

    const step = (now) => {
      if (cancelled) return
      const elapsed = now - startTime
      const tNorm = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - tNorm, 3)
      const nextY = Math.round(startY + (getTargetY() - startY) * eased)
      window.scrollTo({ top: nextY, behavior: 'instant' })
      if (tNorm < 1) {
        requestAnimationFrame(step)
      } else {
        window.removeEventListener('wheel', cancel)
        window.removeEventListener('touchstart', cancel)
      }
    }

    requestAnimationFrame(step)
  }

  return (
    <div className="relative h-[460vh] max-md:-mb-[24vh] max-md:h-[380vh]" id="hw" ref={wrapRef}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-[60px] max-md:pt-6">
        <div
          className="relative flex flex-1 flex-col items-center justify-center px-7 text-center max-md:px-5"
          ref={boxRef}
        >
          <div className="start" ref={startRef} />
          <div className="hl-wrap">
            <h1 className="hl" ref={h1Ref}>
              <span className="l1">
                <span className="w serif" data-k="0">
                  {t.hero.hello}
                </span>
                <span className="w serif" data-k="1">
                  {t.hero.comma}
                </span>
                <span className="w serif" data-k="1" data-g="0.2">
                  {t.hero.im}
                </span>
              </span>
              <span className="l2" ref={l2Ref}>
                <span className="w disp" data-k="2">
                  {t.hero.first}
                </span>
                <span className="w disp" data-k="3" data-g="0.2">
                  {t.hero.last}
                </span>
                <span className="slot" ref={slotRef} />
              </span>
            </h1>

            {/* 3 stiker pita 2 baris bertingkat mengelilingi headline */}
            {t.hero.pillars.map((item, idx) => (
              <div
                className={`stk stk-${idx}`}
                key={item.no}
                aria-label={item.label}
              >
                <div
                  className={`stk-inner stk-${item.tone} stk-${item.cut}`}
                  aria-hidden="true"
                >
                  {idx === 0 && (
                    <>
                      <span className="stk-r1">
                        <span>{item.line1}</span>
                        {StickerIcons.codeFrame}
                      </span>
                      <span className="stk-r2">
                        {StickerIcons.starburst}
                        <span>{item.line2}</span>
                      </span>
                    </>
                  )}
                  {idx === 1 && (
                    <>
                      <span className="stk-r1">
                        {StickerIcons.nodeBulb}
                        <span>{item.line1}</span>
                      </span>
                      <span className="stk-r2">
                        {StickerIcons.star5}
                        <span>{item.line2}</span>
                      </span>
                    </>
                  )}
                  {idx === 2 && (
                    <>
                      <span className="stk-r1">
                        <span>{item.line1}</span>
                        {StickerIcons.orbitCog}
                      </span>
                      <span className="stk-r2">
                        {StickerIcons.starburst}
                        <span>{item.line2}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="bio" ref={bioRef}>
            <p
              className="desc"
              key={`quote-v3-${lang}`}
              ref={descBoxRef}
              aria-label={t.hero.desc}
            >
              {quoteWords.map((word, wIdx) => (
                <span key={`${lang}-w-${wIdx}`}>
                  <span className="inline-block whitespace-nowrap">
                    {Array.from(word).map((ch, cIdx) => (
                      <span className="q-char" key={cIdx} aria-hidden="true">
                        {ch}
                      </span>
                    ))}
                  </span>
                  {wIdx < quoteWords.length - 1 ? (
                    <span className="q-char" aria-hidden="true">
                      {' '}
                    </span>
                  ) : null}
                </span>
              ))}
            </p>
            <div className="btns b">
              <a
                className="btn pri"
                href="#work"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('work')
                }}
              >
                {t.hero.ctaWork}
              </a>
              <button
                type="button"
                className="btn cursor-pointer"
                onClick={() => setIsCvOpen(true)}
              >
                {t.hero.ctaCv}
              </button>
            </div>
          </div>
        </div>
        {/* Hint menempel ke panel sticky (.stage), bukan .c — sehingga
            tetap terlihat di dasar viewport saat konten .c melebihi tinggi
            panel dan terpotong overflow:hidden. Klik = lompat ke hero penuh. */}
        <button className="hint" type="button" onClick={jumpToFull} ref={hintRef}>
          {t.hero.hint}
        </button>
      </div>
      <div className="photo pic" ref={picRef}>
        <img ref={imgHeroRef} src="/images/gastin-hero.png" alt="Foto Gastin Alfiansa" />
        <img
          ref={imgAboutRef}
          src="/images/gastin-about.png"
          alt=""
          aria-hidden="true"
          style={{ opacity: 0 }}
        />
      </div>

      <CvModal
        isOpen={isCvOpen}
        onClose={() => setIsCvOpen(false)}
        cvHref={t.hero.cvHref}
        cvData={t.hero.cvModal}
      />
    </div>
  )
}
