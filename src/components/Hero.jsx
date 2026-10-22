import { useLayoutEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'

/**
 * Hero scrollytelling — wrapper 460vh berisi panel sticky.
 * Progres scroll (0–1) menggerakkan: kata "Halo / saya / Gastin / Alfiansa"
 * muncul bertahap, foto pindah ke slot di kanan nama, lalu blok bio
 * (peran, kalimat utama, deskripsi, tombol) fade + blur + naik.
 *
 * Perbaikan posisi awal: padding-top kompensasi memakai SETENGAH tinggi
 * konten tersembunyi (l2 + bio) sehingga komposasi awal (foto + "Halo")
 * benar-benar berada di tengah layar, bukan terdorong ke bawah.
 */
export default function Hero() {
  const { lang, t } = useLang()
  const wrapRef = useRef(null)
  const boxRef = useRef(null)
  const h1Ref = useRef(null)
  const l2Ref = useRef(null)
  const bioRef = useRef(null)
  const startRef = useRef(null)
  const slotRef = useRef(null)
  const picRef = useRef(null)
  const hintRef = useRef(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const box = boxRef.current
    const h1 = h1Ref.current
    const l2 = l2Ref.current
    const bio = bioRef.current
    const start = startRef.current
    const slot = slotRef.current
    const pic = picRef.current
    const hint = hintRef.current
    if (!wrap || !box || !h1) return undefined

    const words = Array.from(h1.querySelectorAll('.w'))
    const spans = Array.from(bio.querySelectorAll('.b'))
    const red = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nat = []

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
      const e = ez(seg(p, 0.12, 0.4))
      start.style.height = `${A * (1 - e)}px`
      start.style.marginBottom = `${18 * (1 - e)}px`

      slot.style.width = `${S * e}px`
      slot.style.marginLeft = `${0.3 * fs * e}px`
      slot.style.height = `${S}px`

      const cr = box.getBoundingClientRect()
      const sr = start.getBoundingClientRect()
      const tr = slot.getBoundingClientRect()
      const sx = sr.left + sr.width / 2 - cr.left
      const sy = sr.top + sr.height / 2 - cr.top
      const tx = tr.left + tr.width / 2 - cr.left
      const ty = tr.top + tr.height / 2 - cr.top
      const size = A + (S - A) * e
      const x = sx + (tx - sx) * e
      const y = sy + (ty - sy) * e

      pic.style.width = `${size}px`
      pic.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`

      bio.style.borderTopColor = `rgba(128,128,128,${0.35 * seg(p, 0.42, 0.5)})`

      spans.forEach((el, i) => {
        const st = ez(seg(p, 0.44 + i * 0.11, 0.55 + i * 0.11))
        el.style.opacity = st
        el.style.filter = `blur(${(1 - st) * 5}px)`
        el.style.transform = `translateY(${(1 - st) * 14}px)`
        el.style.pointerEvents = st > 0.6 ? 'auto' : 'none'
      })

      hint.style.opacity = 1 - seg(p, 0, 0.06)
    }

    const onScroll = () => render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [lang])

  /** Klik "SCROLL ↓" → lompat ke titik hero dengan seluruh konten tampil
   *  (progres p ≈ 0.85: bio + tombol interaktif penuh). */
  const jumpToFull = () => {
    const wrap = wrapRef.current
    if (!wrap) return
    const total = wrap.offsetHeight - window.innerHeight
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: Math.round(wrap.getBoundingClientRect().top + window.scrollY + total * 0.85),
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="relative h-[460vh]" id="hw" ref={wrapRef}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-[60px] max-md:pt-6">
        <div
          className="relative flex flex-1 flex-col items-center justify-center px-7 text-center"
          ref={boxRef}
        >
          <div className="start" ref={startRef} />
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
          <div className="bio" ref={bioRef}>
            <div className="role b">{t.hero.role}</div>
            <p className="desc b">{t.hero.desc}</p>
            <div className="btns b">
              <a className="btn pri" href="#work">
                {t.hero.ctaWork}
              </a>
              <a className="btn" href={t.hero.cvHref}>
                {t.hero.ctaCv}
              </a>
            </div>
          </div>
          <div className="photo pic" ref={picRef}>
            <img src="/images/gastin-hero.png" alt="Foto Gastin Alfiansa" />
          </div>
        </div>
        {/* Hint menempel ke panel sticky (.stage), bukan .c — sehingga
            tetap terlihat di dasar viewport saat konten .c melebihi tinggi
            panel dan terpotong overflow:hidden. Klik = lompat ke hero penuh. */}
        <button className="hint" type="button" onClick={jumpToFull} ref={hintRef}>
          {t.hero.hint}
        </button>
      </div>
    </div>
  )
}
