import { isMobile, reducedMotion } from './gsap.js'

let activeScrollAnim = null

/**
 * Batalkan animasi scroll navigasi yang sedang berjalan jika ada.
 */
export function cancelNavScroll() {
  if (activeScrollAnim) {
    activeScrollAnim.cancel()
    activeScrollAnim = null
  }
}

/**
 * Hitung target scrollY di mana seksi yang dituju muncul secara utuh ("muncul keseluruhan"):
 * - #hw: scrollytelling Hero selesai membentuk headline lengkap (p ≈ 0.88 / 0.85).
 * - #about: seksi Tentang terlihat utuh di bawah navbar fixed.
 * - #work: seksi Project (ke-4 kartu & judul) meluncur keluar penuh dari bawah tirai #about.
 * - #experience: seksi Pengalaman selesai mendarat (intro 44vh), header & titik/overview 100% aktif.
 * - #services: seksi Layanan selesai membentuk tabel (p ≈ 0.73) & seluruh 4 kotak layanan terbaca jelas.
 * - #contact: kartu Kontak (.cta-box) terbentuk 100% utuh (p = 1) dengan teks & tombol email lime muncul penuh.
 */
export function getSectionTargetY(id) {
  const targetId = String(id || '').replace(/^#/, '')
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
  const mobile = isMobile()

  if (targetId === 'hw') {
    const wrap = document.getElementById('hw')
    if (!wrap) return 0
    const ratio = mobile ? 0.85 : 0.88
    const total = wrap.offsetHeight - vh
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
    return Math.max(0, Math.round(wrapTop + total * ratio))
  }

  if (targetId === 'about') {
    const el = document.getElementById('about')
    if (!el) return 0
    const elTop = el.getBoundingClientRect().top + window.scrollY
    return Math.max(0, Math.round(elTop))
  }

  if (targetId === 'work') {
    const el = document.getElementById('work')
    if (!el) return 0
    const elTop = el.getBoundingClientRect().top + window.scrollY
    return Math.max(0, Math.round(elTop))
  }

  if (targetId === 'experience') {
    const wrap = document.getElementById('experience')
    if (!wrap) return 0
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
    // INTRO_VH = 44vh di Experience.jsx untuk fase pendaratan kartu Work -> titik
    const introLen = 0.44 * vh
    return Math.max(0, Math.round(wrapTop + introLen + 10))
  }

  if (targetId === 'services') {
    const wrap = document.getElementById('services')
    if (!wrap) return 0
    const stage = wrap.firstElementChild
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
    const stageH = stage ? stage.offsetHeight : vh
    const total = Math.max(1, wrap.offsetHeight - stageH)
    // p = 0.73 adalah titik di mana judul, garis drop, dan seluruh 4 teks layanan sudah 100% muncul & hover aktif
    return Math.max(0, Math.round(wrapTop + total * 0.73))
  }

  if (targetId === 'contact') {
    const box = document.getElementById('contact')
    const svc = document.getElementById('services')
    if (!box) return 0
    const svcStage = svc?.firstElementChild
    const svcRect = svc ? svc.getBoundingClientRect() : { bottom: 0 }
    const stageH = svcStage ? svcStage.offsetHeight : vh
    const boxRect = box.getBoundingClientRect()

    const startScroll = window.scrollY + svcRect.bottom - stageH
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
    // Gunakan Math.ceil + 2 agar window.scrollY >= endScroll dan p >= 1 tercapai secara sempurna
    return Math.max(0, Math.ceil(endScroll) + 2)
  }

  const genericEl = document.getElementById(targetId)
  if (genericEl) {
    return Math.max(0, Math.round(genericEl.getBoundingClientRect().top + window.scrollY))
  }
  return 0
}

/**
 * Navigasi halus berbasis requestAnimationFrame ke seksi yang dituju
 * dengan kecepatan responsif, kurva cubic ease-out, dan pembatalan instan saat disentuh user.
 */
export function navigateToSection(id, options = {}) {
  const targetId = String(id || '').replace(/^#/, '')
  const targetY = getSectionTargetY(targetId)

  cancelNavScroll()

  if (reducedMotion() || options.instant) {
    window.scrollTo({ top: targetY, behavior: 'instant' })
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`)
    }
    return
  }

  const startY = window.scrollY
  const distance = Math.abs(targetY - startY)
  if (distance < 3) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`)
    }
    return
  }

  // Durasi scroll proporsional terhadap jarak: minimal 520ms, maksimal 860ms
  const duration = Math.min(860, Math.max(520, Math.round(440 + Math.sqrt(distance) * 7.5)))
  const startTime = performance.now()
  let cancelled = false

  const onUserInterrupt = () => {
    cancelled = true
    cleanup()
  }

  const cleanup = () => {
    window.removeEventListener('wheel', onUserInterrupt)
    window.removeEventListener('touchstart', onUserInterrupt)
    if (activeScrollAnim && activeScrollAnim.cancel === onUserInterrupt) {
      activeScrollAnim = null
    }
  }

  window.addEventListener('wheel', onUserInterrupt, { passive: true, once: true })
  window.addEventListener('touchstart', onUserInterrupt, { passive: true, once: true })

  const step = (now) => {
    if (cancelled) return
    const elapsed = now - startTime
    const tNorm = Math.min(1, elapsed / duration)
    // Cubic ease-out
    const eased = 1 - Math.pow(1 - tNorm, 3)
    const nextY = Math.round(startY + (targetY - startY) * eased)
    window.scrollTo({ top: nextY, behavior: 'instant' })

    if (tNorm < 1) {
      requestAnimationFrame(step)
    } else {
      cleanup()
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`)
      }
    }
  }

  activeScrollAnim = { cancel: onUserInterrupt }
  requestAnimationFrame(step)
}

if (typeof window !== 'undefined') {
  window.navigateToSection = navigateToSection
  window.getSectionTargetY = getSectionTargetY
}
