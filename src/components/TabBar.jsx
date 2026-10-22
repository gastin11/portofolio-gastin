import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'

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
 * Navigasi bawah mobile (tab bar glass) — scroll-spy menandai tab aktif,
 * otomatis tint gelap (on-dark) di atas seksi "Tentang".
 */
export default function TabBar() {
  const { lang, toggle, t } = useLang()
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    const ids = ['hw', 'about', 'work', 'services', 'contact']
    const dark = document.getElementById('about')

    const update = () => {
      const y = window.innerHeight * 0.45
      let cur = ids[0]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= y) cur = id
      })
      bar.querySelectorAll('a.tb').forEach((a) => {
        a.classList.toggle('act', a.getAttribute('href') === `#${cur}`)
      })
      if (dark) {
        const r = dark.getBoundingClientRect()
        const by = window.innerHeight - 44
        bar.classList.toggle('on-dark', r.top < by && r.bottom > by)
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

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="tabbar tabbar-glass fixed left-3 right-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-[60] flex justify-between gap-0.5 rounded-[28px] p-[7px] md:hidden"
      role="navigation"
      ref={barRef}
    >
      <a className="tb" href="#hw" onClick={scrollToTop}>
        {/* Ganti placeholder dengan <img src="images/logo.svg" alt="Logo" /> */}
        <span className="tph" />
        <span>{t.tabs.home}</span>
      </a>
      <a className="tb" href="#about">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Icons.user}
        </svg>
        <span>{t.tabs.about}</span>
      </a>
      <a className="tb" href="#work">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Icons.briefcase}
        </svg>
        <span>{t.tabs.work}</span>
      </a>
      <a className="tb" href="#services">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Icons.layers}
        </svg>
        <span>{t.tabs.services}</span>
      </a>
      <a className="tb" href="#contact">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Icons.mail}
        </svg>
        <span>{t.tabs.contact}</span>
      </a>
      <button
        className="tb tl"
        type="button"
        aria-label={t.tabs.switchLabel}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Icons.languages}
        </svg>
        <span>{lang.toUpperCase()}</span>
      </button>
    </div>
  )
}
