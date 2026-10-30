import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n/LangContext.jsx'
import { clamp01, lerp, isMobile, reducedMotion } from '../motion/gsap.js'
import { getSectionTargetY } from '../motion/navScroll.js'

/**
 * Blok CTA kontak — panel kobalt dengan tombol email lime yang membuka
 * modal popup "Editorial Letterhead" (Dari -> Kepada terkunci -> Subjek -> Isi Pesan).
 * Transisi masuk: keempat kolom biru kobalt dari seksi Services merapat,
 * menyatu menjadi satu blok kobalt utuh, dan membulat (0px -> 60px / 36px)
 * membentuk panel .cta-box Contact. Setelah kartu .cta-box terbentuk penuh (p >= 1),
 * teks & tombol lime muncul dengan animasi Staggered Editorial Mask Rise.
 */
export default function ContactCTA() {
  const { t } = useLang()
  const [isOpen, setIsOpen] = useState(false)
  const [modalStage, setModalStage] = useState('closed') // 'closed' | 'opening' | 'open' | 'closing'
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const fromInputRef = useRef(null)
  const closeTimerRef = useRef(null)
  const rafRef = useRef(null)
  const wrapRef = useRef(null)
  const boxRef = useRef(null)
  const morphRef = useRef(null)

  const openModal = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setHasSubmitted(false)
    setIsOpen(true)
    if (reducedMotion()) {
      setModalStage('open')
      return
    }
    setModalStage('opening')
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setModalStage('open')
      })
    })
  }

  const closeModal = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (reducedMotion()) {
      setModalStage('closed')
      setIsOpen(false)
      return
    }
    setModalStage('closing')
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
      setModalStage('closed')
      closeTimerRef.current = null
    }, 230)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Transisi Services → Contact: 4 kolom kobalt Services menyatu & membulat jadi .cta-box,
  // lalu begitu .cta-box terbentuk (p >= 0.88 atau sudah di viewport), teks & tombol muncul dengan Editorial Mask Rise.
  useLayoutEffect(() => {
    const box = boxRef.current
    const morph = morphRef.current
    const svc = document.getElementById('services')
    const table = document.querySelector('.svc-table')
    if (!box || !morph || !svc || !table) return undefined

    const strips = Array.from(morph.children)

    const updateMargin = () => {
      const vh = window.innerHeight
      const mobile = isMobile()
      const svcStage = svc.firstElementChild
      if (svcStage && wrapRef.current) {
        const bottomSpace = Math.max(
          0,
          svcStage.offsetHeight - (table.offsetTop + table.offsetHeight)
        )
        const desiredGap = mobile ? 28 : 52
        wrapRef.current.style.marginTop = `${Math.round(desiredGap - bottomSpace)}px`
      }
    }

    // Set margin-top sebelum membaca koordinat atau scroll
    updateMargin()

    // Jika saat ganti bahasa posisi user sedang berada di seksi Contact,
    // sesuaikan kembali scroll position ke posisi target yang baru secara presisi
    const isAtContact =
      window.location.hash === '#contact' ||
      (box.getBoundingClientRect().top <= window.innerHeight * 0.75 &&
        box.getBoundingClientRect().bottom >= 0)

    if (isAtContact) {
      const targetY = getSectionTargetY('contact')
      if (targetY > 0 && Math.abs(window.scrollY - targetY) > 2) {
        window.scrollTo({ top: targetY, behavior: 'instant' })
      }
    }

    const render = () => {
      const cells = table.querySelectorAll('[data-svc-cell]')
      if (reducedMotion()) {
        morph.style.display = 'none'
        box.style.backgroundColor = ''
        box.style.opacity = '1'
        box.classList.add('is-revealed')
        return
      }

      const vh = window.innerHeight
      const mobile = isMobile()
      const targetR = mobile ? 36 : 60

      updateMargin()

      const svcRect = svc.getBoundingClientRect()
      const stageRect = svc.firstElementChild
        ? svc.firstElementChild.getBoundingClientRect()
        : { height: vh }
      const boxRect = box.getBoundingClientRect()

      // Mulai tepat di titik lepas sticky #services (svcRect.bottom === stageRect.height)
      // dan akhiri tepat saat card Contact selesai naik ke atas TabBar (sebelum footer reveal)
      // dengan zona jeda (dwell buffer) aman sebelum seksi ThankYou mulai terbuka.
      const startScroll = window.scrollY + svcRect.bottom - stageRect.height
      const targetBottomInView = vh - (mobile ? 96 : 88)
      const docBoxBottom = window.scrollY + boxRect.bottom
      const rawEnd = Math.max(
        startScroll + (mobile ? vh * 0.22 : vh * 0.26),
        docBoxBottom - targetBottomInView
      )

      const mainEl = box.closest('.reveal-main')
      const mainBottomDoc = mainEl
        ? window.scrollY + mainEl.getBoundingClientRect().bottom
        : document.documentElement.scrollHeight - (mobile ? 210 : 200)
      const thankYouStartScroll = mainBottomDoc - vh
      const dwellBuffer = mobile ? 105 : 130
      const endScroll = Math.max(
        startScroll + 100,
        Math.min(rawEnd, thankYouStartScroll - dwellBuffer)
      )

      const p = clamp01((window.scrollY - startScroll) / Math.max(1, endScroll - startScroll))
      const root = document.documentElement

      if (p <= 0) {
        delete root.dataset.ctaFormed
        delete root.dataset.ctaMorphing
        box.classList.remove('is-revealed')
        const svcTotal = Math.max(1, svcRect.height - stageRect.height)
        const svcP = clamp01(-svcRect.top / svcTotal)
        table.classList.toggle('svc-ready', svcP >= 0.7)
        morph.style.display = 'none'
        box.style.backgroundColor = ''
        box.style.opacity = '0'
        cells.forEach((cell) => {
          const textWrap = cell.querySelector('div')
          if (textWrap) textWrap.style.color = ''
        })
        return
      }

      // Kartu Contact dianggap sudah terbentuk penuh jika:
      // 1. p >= 0.88 (morphing sudah mendekati / mencapai 1)
      // 2. ATAU kartu sudah berada di dalam viewport dan hampir seluruhnya terlihat
      //    (misal saat ganti bahasa atau penyesuaian scroll)
      const isFormed =
        p >= 0.88 ||
        (boxRect.top <= vh * 0.75 && boxRect.bottom <= vh + 80)

      if (isFormed) {
        root.dataset.ctaFormed = '1'
        delete root.dataset.ctaMorphing
        table.classList.add('svc-ready')
        morph.style.display = 'none'
        box.style.backgroundColor = ''
        box.style.opacity = '1'
        // Teks & tombol dipastikan muncul saat kartu Contact terbentuk
        box.classList.add('is-revealed')
        cells.forEach((cell) => {
          const textWrap = cell.querySelector('div')
          if (textWrap) textWrap.style.color = ''
        })
        return
      }

      // p di antara (0, 0.88): kotak biru sedang bergerak antara grid Services dan card Contact.
      // Selama kartu belum terbentuk penuh, sembunyikan teks & tombol (.is-revealed dihapus).
      delete root.dataset.ctaFormed
      root.dataset.ctaMorphing = '1'
      box.classList.remove('is-revealed')
      table.classList.remove('svc-ready')
      box.style.backgroundColor = 'transparent'
      box.style.opacity = '1'

      const tr = table.getBoundingClientRect()
      const sx = tr.left
      const sy = tr.top
      const sw = tr.width
      const sh = tr.height
      // Pastikan target Y tidak pernah berada di atas posisi tabel Services saat reverse scroll
      const targetTop = Math.max(sy + 12, boxRect.top)

      // Gunakan interpolasi linear (geomP = p) agar kecepatan gerak relatif terhadap scroll
      // selalu konstan & monoton (tidak pernah melambat di dekat p = 0 yang menyebabkan efek memantul ke bawah).
      const geomP = p
      const curL = lerp(sx, boxRect.left, geomP)
      const curT = lerp(sy, targetTop, geomP)
      const curW = lerp(sw, boxRect.width, geomP)
      const curH = lerp(sh, boxRect.height, geomP)
      const curR = lerp(0, targetR, p)

      // Saat warna biru bergerak turun meninggalkan kotak Services, kembalikan warna teks
      // kotak Services ke semula begitu blok biru sudah turun melewati tengah kotak tersebut.
      cells.forEach((cell) => {
        const textWrap = cell.querySelector('div')
        if (!textWrap) return
        const cr = cell.getBoundingClientRect()
        const midY = cr.top + cr.height * 0.52
        const coveredByBlue = curT < midY && curT + curH > cr.top + cr.height * 0.25
        textWrap.style.color = coveredByBlue ? '#ffffff' : ''
      })

      morph.style.display = 'grid'
      morph.style.gridTemplateColumns = mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
      morph.style.gap = '0px'
      morph.style.left = `${curL.toFixed(1)}px`
      morph.style.top = `${curT.toFixed(1)}px`
      morph.style.width = `${curW.toFixed(1)}px`
      morph.style.height = `${curH.toFixed(1)}px`
      morph.style.borderRadius = `${curR.toFixed(1)}px`
      morph.style.backgroundColor = 'var(--pri)'
      morph.style.opacity = '1'

      strips.forEach((st) => {
        st.style.borderRadius = '0px'
      })
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
    }
  }, [t])

  const m = t.contact.modal
  const recipient = t.contact.recipient || 'gastinalfiansa@gmail.com'

  // Kunci scroll halaman & pasang listener tombol Escape saat modal aktif
  useEffect(() => {
    if (!isOpen) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      fromInputRef.current?.focus()
    }, 90)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const buildFormattedBody = () => {
    const msg = message.trim()
    const sender = from.trim()
    return sender ? `${msg}\n\n— ${sender}` : msg
  }

  const getGmailComposeUrl = () => {
    const su = encodeURIComponent(subject.trim() || 'Collaboration / Inquiry')
    const body = encodeURIComponent(buildFormattedBody())
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${su}&body=${body}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalSubject = encodeURIComponent(subject.trim() || 'Collaboration / Inquiry')
    const finalBody = encodeURIComponent(buildFormattedBody())
    setHasSubmitted(true)
    window.location.href = `mailto:${recipient}?subject=${finalSubject}&body=${finalBody}`
  }

  const handleChipClick = (chip) => {
    setSubject((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return `[${chip}] `
      if (trimmed.startsWith(`[${chip}]`)) return prev
      return `[${chip}] ${trimmed.replace(/^\[[^\]]+\]\s*/, '')}`
    })
  }

  return (
    <>
      <div
        ref={wrapRef}
        className="relative mx-auto w-[calc(100%-56px)] max-w-[1244px] max-md:w-[calc(100%-24px)]"
      >
        {/* Overlay morph Opsi A: 4 kolom biru kobalt Services merapat & membulat menjadi .cta-box */}
        <div
          ref={morphRef}
          className="pointer-events-none fixed z-[1] overflow-hidden will-change-transform"
          style={{ display: 'none', left: 0, top: 0 }}
          aria-hidden="true"
        >
          <span className="block h-full w-full bg-pri" />
          <span className="block h-full w-full bg-pri" />
          <span className="block h-full w-full bg-pri" />
          <span className="block h-full w-full bg-pri" />
        </div>
        <div
          ref={boxRef}
          className="cta-box relative z-[2] w-full rounded-box bg-pri px-8 pt-20 pb-[84px] text-center text-white max-md:rounded-[36px] max-md:px-5 max-md:pt-14 max-md:pb-[60px]"
          id="contact"
        >
          <span className="mb-[26px] block overflow-hidden py-0.5">
            <small
              className="cta-reveal-line block tracking-[0.08em]"
              style={{ '--cta-d': '0ms' }}
            >
              {t.contact.label}
            </small>
          </span>
          <h2 className="disp">
            <span className="-my-[0.08em] block overflow-hidden py-[0.08em]">
              <span className="cta-reveal-line block" style={{ '--cta-d': '85ms' }}>
                {t.contact.heading} <em>{t.contact.headingAccent}</em>
              </span>
            </span>
            <span className="-my-[0.08em] block overflow-hidden py-[0.08em]">
              <span className="cta-reveal-line block" style={{ '--cta-d': '170ms' }}>
                {t.contact.headingEnd}
              </span>
            </span>
          </h2>
          <div className="mt-[38px]">
            <button
              type="button"
              onClick={openModal}
              className="cta-reveal-btn inline-block cursor-pointer rounded-pill border-0 bg-lime px-7 py-3.5 font-mono text-[14px] font-bold text-[#101010] hover:-translate-y-0.5 active:translate-y-0"
            >
              {t.contact.email}
            </button>
          </div>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            className={`cta-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md max-md:px-3.5 max-md:py-4 ${
              modalStage === 'open' ? 'is-open' : modalStage === 'closing' ? 'is-closing' : ''
            }`}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <div
              className="cta-modal-card relative w-full max-w-[580px] overflow-hidden rounded-[28px] border border-ink/15 bg-bg text-left text-ink shadow-[0_28px_80px_rgba(0,0,0,0.5)] max-md:max-h-[90dvh] max-md:overflow-y-auto max-md:rounded-[22px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar Editorial — Kepala Surat */}
              <div
                className="cta-modal-row bg-pri px-6 pt-4 pb-5 text-white max-md:px-4 max-md:pt-3.5 max-md:pb-3.5"
                style={{ '--row-d': '40ms' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-bold tracking-[0.08em] text-lime uppercase max-md:text-[9.5px]">
                    {m.tag}
                  </span>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label={m.close}
                    className="cursor-pointer rounded-pill border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-white transition-colors hover:border-brand hover:bg-brand hover:text-white active:border-brand active:bg-brand"
                  >
                    [ ✕ ]
                  </button>
                </div>
                <h3
                  id="contact-modal-title"
                  className="disp mt-1.5 text-[clamp(24px,4vw,34px)] leading-[1] text-white"
                >
                  {m.title}{' '}
                  <span className="serif font-normal text-lime normal-case">
                    {m.titleAccent}
                  </span>
                </h3>
              </div>

              {/* Form Editorial Letterhead */}
              <form onSubmit={handleSubmit} className="divide-y divide-ink/10">
                {/* Baris 1: DARI */}
                <div
                  className="cta-modal-row flex items-center gap-3 px-6 py-3.5 transition-colors focus-within:bg-pri/[0.04] max-md:px-4 max-md:py-2.5"
                  style={{ '--row-d': '80ms' }}
                >
                  <label
                    htmlFor="mail-from"
                    className="w-[88px] shrink-0 text-[11px] font-bold tracking-[0.08em] text-mute uppercase max-md:w-[70px] max-md:text-[10px]"
                  >
                    {m.fromLabel}
                  </label>
                  <input
                    id="mail-from"
                    ref={fromInputRef}
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder={m.fromPlaceholder}
                    className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[13px] text-ink placeholder:text-mute/55 focus:outline-none max-md:text-[12px]"
                  />
                </div>

                {/* Baris 2: KEPADA (Default, tidak bisa diganti) */}
                <div
                  className="cta-modal-row flex items-center gap-3 px-6 py-3.5 max-md:px-4 max-md:py-2.5"
                  style={{ '--row-d': '115ms' }}
                >
                  <label
                    htmlFor="mail-to"
                    className="w-[88px] shrink-0 text-[11px] font-bold tracking-[0.08em] text-mute uppercase max-md:w-[70px] max-md:text-[10px]"
                  >
                    {m.toLabel}
                  </label>
                  <input
                    id="mail-to"
                    type="email"
                    value={recipient}
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    className="min-w-0 flex-1 cursor-default select-all border-0 bg-transparent font-mono text-[13px] font-bold text-pri focus:outline-none max-md:text-[12px]"
                  />
                </div>

                {/* Baris 3: SUBJEK + Quick-Chips */}
                <div
                  className="cta-modal-row px-6 py-3.5 transition-colors focus-within:bg-pri/[0.04] max-md:px-4 max-md:py-2.5"
                  style={{ '--row-d': '150ms' }}
                >
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="mail-subject"
                      className="w-[88px] shrink-0 text-[11px] font-bold tracking-[0.08em] text-mute uppercase max-md:w-[70px] max-md:text-[10px]"
                    >
                      {m.subjectLabel}
                    </label>
                    <input
                      id="mail-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={m.subjectPlaceholder}
                      className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[13px] font-bold text-ink placeholder:font-normal placeholder:text-mute/55 focus:outline-none max-md:text-[12px]"
                    />
                  </div>
                  {/* Chip topik cepat */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[100px] max-md:mt-2 max-md:pl-0">
                    {m.subjectChips.map((chip) => {
                      const active = subject.trim().startsWith(`[${chip}]`)
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                          className={`cursor-pointer rounded-pill border px-2.5 py-0.5 font-mono text-[10px] font-bold transition-colors max-md:px-2 max-md:text-[9.5px] ${
                            active
                              ? 'border-pri bg-pri text-white'
                              : 'border-ink/15 bg-transparent text-mute hover:border-ink/40 hover:text-ink'
                          }`}
                        >
                          + {chip}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Baris 4: ISI PESAN */}
                <div
                  className="cta-modal-row px-6 pt-3.5 pb-4 transition-colors focus-within:bg-pri/[0.04] max-md:px-4 max-md:pt-2.5 max-md:pb-3"
                  style={{ '--row-d': '185ms' }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="mail-message"
                      className="text-[11px] font-bold tracking-[0.08em] text-mute uppercase max-md:text-[10px]"
                    >
                      {m.messageLabel}
                    </label>
                    <span className="text-[10px] tracking-[0.06em] text-mute/70 max-md:text-[9.5px]">
                      {message.length} {m.charUnit}
                    </span>
                  </div>
                  <textarea
                    id="mail-message"
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={m.messagePlaceholder}
                    className="w-full resize-none border-0 bg-transparent font-mono text-[13px] leading-[1.6] text-ink placeholder:text-mute/55 focus:outline-none max-md:text-[12px]"
                  />
                </div>

                {/* Baris bantuan ringkas jika sudah klik kirim (opsi langsung ke Gmail Web) */}
                {hasSubmitted && (
                  <div className="flex items-center justify-between gap-3 bg-pri/[0.05] px-6 py-2.5 text-[11px] max-md:px-4 max-md:py-2 max-md:text-[10.5px]">
                    <span className="flex items-center gap-2 text-mute">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-pri"
                        aria-hidden="true"
                      />
                      <span>{m.sentNote}</span>
                    </span>
                    <a
                      href={getGmailComposeUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-pill border border-pri/30 bg-pri/10 px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.02em] text-pri no-underline transition-colors hover:border-pri hover:bg-pri hover:text-white max-md:px-2.5 max-md:text-[10px]"
                    >
                      {m.openGmail}
                    </a>
                  </div>
                )}

                {/* Footer Modal: Tombol Batal & Kirim */}
                <div
                  className="cta-modal-row flex items-center justify-end gap-2.5 bg-ink/[0.025] px-6 py-3.5 max-md:px-4 max-md:py-3"
                  style={{ '--row-d': '220ms' }}
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded-pill border border-ink/20 bg-transparent px-5 py-2.5 font-mono text-[12px] font-bold text-ink transition-colors hover:bg-ink/5 max-md:flex-1 max-md:py-2 max-md:text-[11.5px]"
                  >
                    {m.cancel}
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-pill border-0 bg-lime px-6 py-2.5 font-mono text-[12.5px] font-bold text-[#101010] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 max-md:flex-[1.4] max-md:py-2 max-md:text-[11.5px]"
                  >
                    {m.send}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
