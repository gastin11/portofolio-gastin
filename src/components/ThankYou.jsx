import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'

/**
 * Panel "Thank you" — footer reveal fixed di dasar layar, tertutup
 * main.reveal-main. Teks muncul dari bawah (translateY 70% → 0,
 * ease-out kubik) saat scroll mendekati akhir halaman.
 */
export default function ThankYou() {
  const { t } = useLang()
  const boxRef = useRef(null)
  const tyRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    const el = tyRef.current
    if (!box || !el) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const c = (v) => Math.min(1, Math.max(0, v))

    const tick = () => {
      const h = box.offsetHeight
      const doc = document.documentElement.scrollHeight
      const shown = window.scrollY + window.innerHeight - (doc - h)
      const p = reduce ? 1 : c(shown / h)
      const eased = 1 - Math.pow(1 - p, 3)
      el.style.transform = `translateY(${(1 - eased) * 70}%)`
      el.style.opacity = eased
    }

    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    tick()
    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  }, [])

  return (
    <section className="thanks" aria-label="Thank you" ref={boxRef}>
      <div className="ty disp" ref={tyRef}>
        {t.thanks.title}
      </div>
      <small>{t.thanks.copy}</small>
    </section>
  )
}
