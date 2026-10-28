import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext.jsx'
import { clamp01, seg, ez, isMobile, reducedMotion } from '../motion/gsap.js'

/**
 * Seksi Layanan (#services) dengan sticky scrollytelling:
 * 1. p = 0.00 → 0.20 : Garis zigzag dari Experience diluruskan oleh LineToTable
 *                      menjadi garis lurus border-top tabel Services.
 * 2. p = 0.20 → 0.35 : Judul section Services muncul setelah garis lurus terbentuk.
 * 3. p = 0.34 → 0.68 : Garis border samping turun dari atas ke bawah diikuti
 *                      munculnya teks isi layanan dengan efek pudar dari atas ke bawah.
 * 4. p = 0.68 → 0.72 : Fase baca & interaksi hover normal.
 * 5. p = 0.72 → 0.88 : Opsi A — keempat kotak layanan terisi background biru (--pri)
 *                      sementara judul dan teks isi Services tetap terlihat (teks putih).
 * 6. p = 0.88 → 1.00 : Warna biru pada kotak-kotak Services turun ke bawah membentuk
 *                      card Contact (.cta-box), sementara section Services tetap ada
 *                      dan background kotak-kotaknya kembali normal seperti semula.
 */
export default function Services() {
  const { lang, t } = useLang()
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const headRef = useRef(null)
  const tableRef = useRef(null)
  const cellRefs = useRef([])
  const fillRefs = useRef([])
  const contentRefs = useRef([])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const stage = stageRef.current
    const head = headRef.current
    const table = tableRef.current
    if (!wrap || !stage || !head || !table) return undefined

    const render = () => {
      const vh = window.innerHeight

      if (reducedMotion()) {
        head.style.opacity = '1'
        head.style.transform = ''
        table.classList.add('svc-ready')
        table.style.setProperty('--svc-line', '1')
        table.style.setProperty('--svc-drop', '1')
        table.style.setProperty('--svc-drop-r2', '1')
        table.style.setProperty('--svc-mid', '1')
        contentRefs.current.forEach((el) => {
          if (!el) return
          el.style.opacity = '1'
          el.style.transform = ''
          el.style.webkitMaskImage = ''
          el.style.maskImage = ''
        })
        fillRefs.current.forEach((el) => {
          if (el) el.style.transform = 'scaleY(0)'
        })
        return
      }

      const r = wrap.getBoundingClientRect()
      const stageRect = stage.getBoundingClientRect()
      // Gunakan tinggi aktual rect (r.height - stageRect.height) agar 100% sinkron dengan titik lepas CSS sticky
      const total = Math.max(1, r.height - stageRect.height)
      const p = clamp01(-r.top / total)
      const mobile = isMobile()

      // Fase 2 (p = 0.20 → 0.38): Judul muncul setelah garis zigzag lurus sempurna
      // dan tetap terlihat walaupun halaman mulai berpindah ke Contact.
      const headIn = ez(seg(p, 0.2, 0.38))
      head.style.opacity = String(headIn)
      head.style.transform = `translate3d(0, ${((1 - headIn) * 16).toFixed(1)}px, 0)`

      // Fase 3 (p = 0.34 → 0.72): Border vertikal turun + teks muncul pudar dari atas ke bawah.
      // Fase 4 (p = 0.72 → 1.00): Jeda baca ringkas sebelum langsung bertransisi ke Contact.
      if (!mobile) {
        const dropP = ez(seg(p, 0.34, 0.7))
        table.style.setProperty('--svc-drop', String(dropP))
        table.style.setProperty('--svc-drop-r2', String(dropP))
        table.style.setProperty('--svc-mid', '0')
      } else {
        const dropR1 = ez(seg(p, 0.34, 0.52))
        const midP = ez(seg(p, 0.5, 0.58))
        const dropR2 = ez(seg(p, 0.54, 0.72))
        table.style.setProperty('--svc-drop', String(dropR1))
        table.style.setProperty('--svc-mid', String(midP))
        table.style.setProperty('--svc-drop-r2', String(dropR2))
      }

      // Begitu keempat kotak layanan selesai ditampilkan (p >= 0.70), hover langsung aktif.
      // Hover hanya dimatikan saat overlay morph ContactCTA sedang bergerak aktif (ctaMorphing === '1').
      const allWipedIn = p >= 0.7
      const ctaMorphing = document.documentElement.dataset.ctaMorphing === '1'
      const canHover = allWipedIn && !ctaMorphing
      table.classList.toggle('svc-ready', canHover)

      for (let i = 0; i < 4; i += 1) {
        const contentEl = contentRefs.current[i]
        const fillEl = fillRefs.current[i]

        // Progres turunnya teks mengikuti turunnya garis border samping
        const rowStart = mobile ? (i < 2 ? 0.34 : 0.54) : 0.34 + i * 0.02
        const rowEnd = mobile ? (i < 2 ? 0.52 : 0.72) : 0.64 + i * 0.02
        const wipeP = ez(seg(p, rowStart, rowEnd))

        if (contentEl) {
          const vis = clamp01(wipeP * 1.25)
          contentEl.style.opacity = String(vis)
          contentEl.style.transform = `translate3d(0, ${((1 - wipeP) * -12).toFixed(1)}px, 0)`
          if (!ctaMorphing) {
            contentEl.style.color = ''
          }
          if (wipeP >= 0.999) {
            contentEl.style.webkitMaskImage = ''
            contentEl.style.maskImage = ''
          } else {
            const stop1 = Math.max(0, wipeP * 130 - 30).toFixed(1)
            const stop2 = (wipeP * 130).toFixed(1)
            const mask = `linear-gradient(to bottom, #000 ${stop1}%, transparent ${stop2}%)`
            contentEl.style.webkitMaskImage = mask
            contentEl.style.maskImage = mask
          }
        }

        if (fillEl) {
          fillEl.style.transform = 'scaleY(0)'
        }
      }
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', render)
    }
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', render)
      }
    }
  }, [lang, t])

  return (
    <section
      id="services"
      ref={wrapRef}
      className="relative z-[2] h-[195vh] max-w-none p-0 max-md:h-[185vh] max-md:p-0"
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden max-md:pt-[18px] max-md:pb-[116px]"
      >
        <div className="mx-auto w-full max-w-[1300px] px-7 max-md:px-5">
          <div ref={headRef} className="will-change-transform" style={{ opacity: 0 }}>
            <small className="max-md:mb-1.5">{t.services.label}</small>
            <h2 className="disp max-md:text-[clamp(36px,9.5vw,46px)] max-md:leading-[0.95]">
              {t.services.heading}{' '}
              <span className="serif text-pri normal-case">{t.services.headingAccent}</span>
            </h2>
          </div>

          <div
            ref={tableRef}
            className="svc-table mt-10 grid grid-cols-4 border-t-[1.5px] border-ink
              [&>div]:px-[18px] [&>div]:pt-6 [&>div]:pb-[60px]
              max-md:mt-5 max-md:grid-cols-2
              max-md:[&>div]:px-3.5 max-md:[&>div]:pt-5 max-md:[&>div]:pb-7"
          >
            {t.services.items.map((item, idx) => (
              <div
                key={item.num}
                ref={(el) => {
                  cellRefs.current[idx] = el
                }}
                data-svc-cell={idx}
                className="overflow-hidden"
              >
                <span
                  ref={(el) => {
                    fillRefs.current[idx] = el
                  }}
                  className="pointer-events-none absolute inset-0 z-0 origin-top scale-y-0 bg-pri"
                  aria-hidden="true"
                />
                <div
                  ref={(el) => {
                    contentRefs.current[idx] = el
                  }}
                  className="relative z-[1] will-change-transform max-md:text-[13px] max-md:leading-[1.52]"
                  style={{ opacity: 0 }}
                >
                  {item.num}
                  <b className="font-disp mt-[34px] mb-3 block text-[26px] leading-none font-normal uppercase max-md:mt-4 max-md:mb-2 max-md:text-[21px]">
                    {item.title}
                  </b>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
