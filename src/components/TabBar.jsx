import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'
import { navigateToSection } from '../motion/navScroll.js'

/* Ikon Lucide (stroke 1.9) — disematkan inline, tanpa dependensi eksternal. */
const Icons = {
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  briefcase: (
    <>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </>
  ),
  layers: (
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  languages: (
    <>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </>
  ),
}

/**
 * Navigasi mobile:
 * - Atas (floating terpisah): pojok kiri atas = tombol beranda (placeholder ikon),
 *   pojok kanan atas = tombol translate (ID/EN).
 * - Bawah (tab bar glass): 4 seksi utama (Tentang, Karya, Layanan, Kontak).
 */
export default function TabBar() {
  const { lang, toggle, t } = useLang()
  const barRef = useRef(null)
  const homeBtnRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    const homeBtn = homeBtnRef.current
    if (!bar) return undefined
    const ids = ['hw', 'about', 'work', 'experience', 'services', 'contact']
    const dark = document.getElementById('about')

    const update = () => {
      const y = window.innerHeight * 0.45
      let cur = ids[0]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= y) cur = id
      })

      // Khusus seksi kontak: jika kartu kontak sudah terbentuk (dataset.ctaFormed === '1')
      // atau bagian atas kartu kontak sudah naik melewati 72% viewport
      const ctaBox = document.getElementById('contact')
      if (
        document.documentElement.dataset.ctaFormed === '1' ||
        (ctaBox && ctaBox.getBoundingClientRect().top <= window.innerHeight * 0.72)
      ) {
        cur = 'contact'
      }

      bar.querySelectorAll('a.tb').forEach((a) => {
        a.classList.toggle('act', a.getAttribute('href') === `#${cur}`)
      })
      if (homeBtn) {
        homeBtn.classList.toggle('act', cur === 'hw')
      }
      if (dark) {
        const r = dark.getBoundingClientRect()
        const by = window.innerHeight - 44
        bar.classList.toggle('on-dark', r.top < by && r.bottom > by)
        if (homeBtn) {
          homeBtn.classList.toggle(
            'on-dark',
            document.documentElement.dataset.portalTop === '1' || (r.top < 44 && r.bottom > 44),
          )
        }
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      {/* Floating atas mobile: Kiri = placeholder ikon beranda, Kanan = translate */}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top,0px))] z-[60] flex items-center justify-between px-4 md:hidden">
        <a
          ref={homeBtnRef}
          href="#hw"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('hw')
          }}
          aria-label={t.tabs.home}
          className="tb-home tabbar-glass pointer-events-auto grid h-11 w-11 place-items-center rounded-[14px] no-underline"
        >
          <img src="/images/logo.png" alt="Gastin Alfiansa" />
          <span className="tph" />
        </a>

        <button
          type="button"
          aria-label={t.tabs.switchLabel}
          onClick={toggle}
          className="pointer-events-auto inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-white/30 bg-brand px-3.5 font-mono text-[11.5px] font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-transform duration-200 active:scale-95"
        >
          <svg
            className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {Icons.languages}
          </svg>
          <span>
            <span
              className={`transition-opacity duration-200 ${
                lang === 'id' ? 'opacity-100' : 'opacity-[0.55]'
              }`}
            >
              ID
            </span>
            <i className="mx-[4px] not-italic opacity-[0.55]">/</i>
            <span
              className={`transition-opacity duration-200 ${
                lang === 'en' ? 'opacity-100' : 'opacity-[0.55]'
              }`}
            >
              EN
            </span>
          </span>
        </button>
      </div>

      {/* Tab bar bawah mobile */}
      <div
        className="tabbar tabbar-glass fixed left-3 right-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-[60] flex justify-between gap-0.5 rounded-[28px] p-[7px] md:hidden"
        role="navigation"
        ref={barRef}
      >
        <a
          className="tb"
          href="#about"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('about')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Icons.user}
          </svg>
          <span>{t.tabs.about}</span>
        </a>
        <a
          className="tb"
          href="#work"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('work')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Icons.briefcase}
          </svg>
          <span>{t.tabs.work}</span>
        </a>
        <a
          className="tb"
          href="#experience"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('experience')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Icons.route}
          </svg>
          <span>{t.tabs.experience}</span>
        </a>
        <a
          className="tb"
          href="#services"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('services')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Icons.layers}
          </svg>
          <span>{t.tabs.services}</span>
        </a>
        <a
          className="tb"
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('contact')
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Icons.mail}
          </svg>
          <span>{t.tabs.contact}</span>
        </a>
      </div>
    </>
  )
}
