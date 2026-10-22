import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'

/**
 * Navbar desktop — kapsul glass terpisah dalam grid 3 kolom
 * (logo kiri, menu tengah, bahasa + CTA kanan).
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
      nav.classList.toggle('on-dark', r.top < 50 && r.bottom > 50)
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
    <nav ref={navRef}>
      <a className="disp logo" href="#hw" aria-label="Kembali ke beranda" onClick={scrollToTop}>
        {/* Ganti placeholder dengan <img src="images/logo.svg" alt="Gastin Alfiansa" /> */}
        <span className="lg">logo</span>
      </a>
      <ul>
        <li>
          <a href="#about">{t.nav.menu[0]}</a>
        </li>
        <li>
          <a href="#work">{t.nav.menu[1]}</a>
        </li>
        <li>
          <a href="#services">{t.nav.menu[2]}</a>
        </li>
      </ul>
      <div className="nr">
        <button
          className="lang"
          type="button"
          aria-label={t.nav.switchLabel}
          onClick={toggle}
        >
          <span className={lang === 'id' ? 'on' : ''}>ID</span>
          <i>/</i>
          <span className={lang === 'en' ? 'on' : ''}>EN</span>
        </button>
        <a className="cta" href="#contact">
          {t.nav.contact}
        </a>
      </div>
    </nav>
  )
}
