import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'
import { navigateToSection } from '../motion/navScroll.js'

/**
 * Navbar desktop — kapsul glass terpisah dalam grid 3 kolom
 * (logo kiri, menu tengah, bahasa + CTA kanan).
 * Glass + state `on-dark` tetap CSS (lihat index.css) karena `on-dark`
 * di-toggle lewat classList, bukan state React.
 */
export default function Navbar() {
  const { lang, toggle, t } = useLang()
  const navRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    const dark = document.getElementById('about')
    if (!nav || !dark) return

    const update = () => {
      const r = dark.getBoundingClientRect()
      nav.classList.toggle(
        'on-dark',
        document.documentElement.dataset.portalTop === '1' || (r.top < 50 && r.bottom > 50),
      )
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
    <nav
      ref={navRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] px-7 py-3.5 max-md:hidden"
    >
      <a
        className="logo capsule disp pointer-events-auto grid h-[42px] w-[42px] place-items-center justify-self-start rounded-[14px] p-0 no-underline"
        href="#hw"
        aria-label="Kembali ke beranda"
        onClick={(e) => {
          e.preventDefault()
          navigateToSection('hw')
        }}
      >
        <img src="/images/logo.png" alt="Gastin Alfiansa" />
        <span className="lg">logo</span>
      </a>
      <ul className="capsule pointer-events-auto m-0 flex list-none gap-[26px] rounded-pill px-7 py-3">
        <li>
          <a
            className="text-[12px] no-underline transition-colors duration-200 hover:text-pri"
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              navigateToSection('about')
            }}
          >
            {t.nav.menu[0]}
          </a>
        </li>
        <li>
          <a
            className="text-[12px] no-underline transition-colors duration-200 hover:text-pri"
            href="#work"
            onClick={(e) => {
              e.preventDefault()
              navigateToSection('work')
            }}
          >
            {t.nav.menu[1]}
          </a>
        </li>
        <li>
          <a
            className="text-[12px] no-underline transition-colors duration-200 hover:text-pri"
            href="#experience"
            onClick={(e) => {
              e.preventDefault()
              navigateToSection('experience')
            }}
          >
            {t.nav.menu[2]}
          </a>
        </li>
        <li>
          <a
            className="text-[12px] no-underline transition-colors duration-200 hover:text-pri"
            href="#services"
            onClick={(e) => {
              e.preventDefault()
              navigateToSection('services')
            }}
          >
            {t.nav.menu[3]}
          </a>
        </li>
      </ul>
      <div className="pointer-events-auto flex items-center justify-self-end gap-2.5">
        <button
          className="lang cursor-pointer rounded-pill border border-[rgba(255,255,255,0.3)] bg-brand px-4 py-[11px] font-mono text-[12px] font-bold leading-[1.2] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-[scale,filter] duration-[250ms] hover:scale-[1.04] hover:brightness-[1.08]"
          type="button"
          aria-label={t.nav.switchLabel}
          onClick={toggle}
        >
          <span
            className={`transition-opacity duration-200 ${
              lang === 'id' ? 'opacity-100' : 'opacity-[0.55]'
            }`}
          >
            ID
          </span>
          <i className="mx-[5px] not-italic opacity-[0.55]">/</i>
          <span
            className={`transition-opacity duration-200 ${
              lang === 'en' ? 'opacity-100' : 'opacity-[0.55]'
            }`}
          >
            EN
          </span>
        </button>
        <a
          className="cta capsule pointer-events-auto rounded-pill px-5 py-[11px] text-[12px] leading-[1.2] no-underline transition-all duration-200 hover:border-pri hover:bg-pri hover:text-white"
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            navigateToSection('contact')
          }}
        >
          {t.nav.contact}
        </a>
      </div>
    </nav>
  )
}
