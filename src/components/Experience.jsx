import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n/LangContext.jsx'

/** Jarak vertikal normal antar titik pengalaman saat mode perjalanan 2D desktop (px). */
const STEP_DESKTOP = 185
/** Ruang atas & bawah di sekitar jalur saat mode perjalanan 2D desktop (px). */
const PAD_DESKTOP = 56
/** Simpangan kiri/kanan zigzag saat perjalanan normal (% dari lebar world). */
const AMP_TRAVEL_DESKTOP = 22
const AMP_TRAVEL_MOBILE = 12
/** Simpangan kiri/kanan zigzag saat 2D overview akhir (% dari lebar world). */
const AMP_OV_DESKTOP = 16
const AMP_OV_MOBILE = 12
/** Lebar zona dwell (plateau) di tiap titik agar garis terkunci pas di pusat titik. */
const DWELL = 0.08
/** Tambahan scroll (vh) di awal seksi untuk mendaratnya kartu Work ke titik + munculnya judul/preview. */
const INTRO_VH = 44
/** Tambahan scroll (vh) di akhir seksi untuk fase outro zigzag → garis tabel Services. */
const OUTRO_VH = 60

const TONES = [
  {
    dot: 'var(--pri)',
    card: 'bg-pri text-white',
    photoBg: 'bg-[#18269e] text-white',
    tag: 'bg-white text-pri',
    divider: 'border-white/20',
    sub: 'text-white',
    navBtn: 'border-white/30 text-white hover:bg-white hover:text-pri',
    badge: 'bg-white text-pri',
    accent: 'text-pri',
  },
  {
    dot: 'var(--lime)',
    card: 'bg-lime text-[#101010]',
    photoBg: 'bg-[#101010]/12 text-[#101010]',
    tag: 'bg-[#101010] text-lime',
    divider: 'border-[#101010]/18',
    sub: 'text-[#101010]/80',
    navBtn: 'border-[#101010]/30 text-[#101010] hover:bg-[#101010] hover:text-lime',
    badge: 'bg-[#101010] text-lime',
    accent: 'text-lime',
  },
  {
    dot: 'var(--lilac)',
    card: 'bg-lilac text-[#101010]',
    photoBg: 'bg-[#101010]/12 text-[#101010]',
    tag: 'bg-[#101010] text-lilac',
    divider: 'border-[#101010]/18',
    sub: 'text-[#101010]/80',
    navBtn: 'border-[#101010]/30 text-[#101010] hover:bg-[#101010] hover:text-lilac',
    badge: 'bg-[#101010] text-lilac',
    accent: 'text-lilac',
  },
  {
    dot: 'var(--peach)',
    card: 'bg-peach text-[#101010]',
    photoBg: 'bg-[#101010]/12 text-[#101010]',
    tag: 'bg-[#101010] text-peach',
    divider: 'border-[#101010]/18',
    sub: 'text-[#101010]/80',
    navBtn: 'border-[#101010]/30 text-[#101010] hover:bg-[#101010] hover:text-peach',
    badge: 'bg-[#101010] text-peach',
    accent: 'text-peach',
  },
]

/** Pecah judul panjang (> 20 karakter) menjadi maksimal 2 baris agar rapi di dalam SVG. */
function splitTitleLines(title) {
  const upper = title.toUpperCase()
  if (upper.length <= 20) return [upper]
  const cut = upper.lastIndexOf(' ', 20)
  if (cut <= 0) return [upper]
  return [upper.slice(0, cut), upper.slice(cut + 1)]
}

/**
 * Seksi "Pengalaman" — scrollytelling jalur zigzag 2D murni:
 * - Seluruh garis, titik, maupun teks label (tanggal, judul, tombol Preview)
 *   digambar di dalam satu kanvas <svg> dan grup <g transform="translate(x, y)">
 *   yang sama, sehingga teks poin dan titik merah dijamin 100% sejajar di semua
 *   browser/device tanpa kemungkinan desinkronisasi layer DOM vs SVG.
 * - Pada mobile, seluruh 8 titik ditata pas di dalam area layar sejak awal
 *   agar tidak ada poin awal atau akhir yang terpotong saat scroll.
 */
export default function Experience() {
  const { lang, t } = useLang()
  const items = t.experience.items
  const n = items.length

  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const camRef = useRef(null)
  const worldRef = useRef(null)
  const svgRef = useRef(null)
  const basePolyRef = useRef(null)
  const progPolyRef = useRef(null)

  const svgNodeRefs = useRef([])
  const svgDotRefs = useRef([])
  const tagRefs = useRef([])
  const prevBtnRefs = useRef([])
  const cardRefs = useRef([])
  const stepBtnRefs = useRef([])
  const renderFnRef = useRef(null)

  const [selectedIdx, setSelectedIdx] = useState(null)
  const [modalIdx, setModalIdx] = useState(null)
  const selectedIdxRef = useRef(null)
  selectedIdxRef.current = selectedIdx

  useEffect(() => {
    if (modalIdx === null) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalIdx(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalIdx])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const stage = stageRef.current
    const cam = camRef.current
    const world = worldRef.current
    const svg = svgRef.current
    const basePoly = basePolyRef.current
    const progPoly = progPolyRef.current
    if (!wrap || !stage || !cam || !world || !svg || !basePoly || !progPoly) return undefined

    const c = (v) => Math.min(1, Math.max(0, v))
    const smooth = (x) => x * x * (3 - 2 * x)
    const seg = (p, a, b) => c((p - a) / (b - a))

    const render = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      stage.style.height = `${vh}px`

      const isMobile = window.matchMedia('(max-width: 820px)').matches
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const r = wrap.getBoundingClientRect()
      const introLen = (INTRO_VH / 100) * vh
      const outroLen = (OUTRO_VH / 100) * vh
      const total = Math.max(1, wrap.offsetHeight - vh - introLen - outroLen)
      const p = c((-r.top - introLen) / total)
      const q = c((-r.top - introLen - total) / outroLen)

      // Fase pendaratan kartu Work → titik jalur (r.top: 0.92vh → -0.45*introLen)
      const flightStart = vh * 0.92
      const flightEnd = -introLen * 0.45
      const flightP = reduce ? 1 : c((flightStart - r.top) / (flightStart - flightEnd))
      // Judul seksi, label teks titik, dan card preview baru muncul SETELAH kartu mendarat di titik
      const revealAfterLand = reduce
        ? 1
        : smooth(c((-r.top - introLen * 0.45) / (introLen * 0.55)))

      // Poin pertama & garis merah baru mulai berjalan setelah fase intro selesai
      const hasStarted = r.top <= -introLen + 8

      // Fase 1 (p = 0 -> 0.84): perjalanan 2D dari titik 0 ke titik n-1
      // Fase 2 (p = 0.84 -> 0.95): transisi mulus ke tampilan penuh seluruh 8 titik
      const travelP = seg(p, 0, 0.84)
      const ov = smooth(seg(p, 0.84, 0.95))

      const rawF = travelP * (n - 1)
      const segIdx = Math.min(n - 2, Math.floor(rawF))
      const u = rawF - segIdx

      // Remap u dengan dwell singkat di tiap ujung segmen agar garis berhenti pas di pusat titik
      let uSnap
      if (u <= DWELL) {
        uSnap = 0
      } else if (u >= 1 - DWELL) {
        uSnap = 1
      } else {
        const uMid = (u - DWELL) / (1 - 2 * DWELL)
        uSnap = smooth(uMid)
      }

      const f = segIdx + uSnap + (n - 1 - (segIdx + uSnap)) * ov
      // Indeks titik yang benar-benar SUDAH disentuh oleh ujung garis biru
      const reachedIdx = Math.min(n - 1, Math.floor(f + 0.004))
      const activeCardIdx =
        ov > 0.5 && selectedIdxRef.current !== null ? selectedIdxRef.current : reachedIdx

      // Pada mobile: area kamera (.xp-cam) membentang penuh dari bawah header hingga di atas .tabbar
      if (isMobile) {
        const tabbar = document.querySelector('.tabbar')
        const tabH = tabbar ? Math.max(74, vh - tabbar.getBoundingClientRect().top) : 76
        cam.style.bottom = `${Math.round(tabH + 10)}px`
      } else {
        cam.style.bottom = ''
      }

      const camH = Math.max(180, cam.clientHeight)
      const worldW = Math.max(1, world.clientWidth)

      // Geometri 2D Overview: seluruh 8 poin berada rapi di dalam camH
      const topPadOv = isMobile ? 32 : 34
      const botPadOv = isMobile ? 36 : 44
      const availH = Math.max(140, camH - topPadOv - botPadOv)
      const ovStep = availH / (n - 1)

      // Pada mobile, gunakan geometri 8-titik penuh sejak awal (ovEff = 1)
      // agar poin pertama & poin terakhir selalu utuh di dalam layar tanpa terpotong.
      const geomOv = isMobile ? 1 : ov
      const baseStep = isMobile ? ovStep : STEP_DESKTOP
      const basePad = isMobile ? topPadOv : PAD_DESKTOP
      const ampTravel = isMobile ? AMP_TRAVEL_MOBILE : AMP_TRAVEL_DESKTOP
      const ampOv = isMobile ? AMP_OV_MOBILE : AMP_OV_DESKTOP

      const curStep = baseStep + (ovStep - baseStep) * geomOv
      const curPadTop = basePad + (topPadOv - basePad) * geomOv
      const curPadBot = basePad + (botPadOv - basePad) * geomOv
      const curAmp = ampTravel + (ampOv - ampTravel) * geomOv
      const curWorldH = curPadTop + (n - 1) * curStep + curPadBot

      // Kanvas world & SVG tetap statis seukuran camH
      world.style.height = `${camH}px`
      svg.style.width = `${worldW}px`
      svg.style.height = `${camH}px`
      svg.setAttribute('width', String(worldW))
      svg.setAttribute('height', String(camH))
      svg.setAttribute('viewBox', `0 0 ${worldW} ${camH}`)

      const rawCoords = items.map((_, i) => {
        const xPct = 50 + (i % 2 === 0 ? -curAmp : curAmp)
        const x = (xPct / 100) * worldW
        const y = curPadTop + i * curStep
        return { x, y }
      })

      const i0 = Math.min(n - 1, Math.floor(f))
      const i1 = Math.min(n - 1, i0 + 1)
      const frac = f - i0
      const rawHeadX = rawCoords[i0].x + (rawCoords[i1].x - rawCoords[i0].x) * frac
      const rawHeadY = rawCoords[i0].y + (rawCoords[i1].y - rawCoords[i0].y) * frac

      const travelFocusY = camH * 0.46
      const minTranslate = Math.min(0, camH - curWorldH)
      const maxTranslate = 0
      const clampedTravelY = Math.max(minTranslate, Math.min(maxTranslate, travelFocusY - rawHeadY))
      const translateY = isMobile ? 0 : clampedTravelY * (1 - ov)

      // Koordinat layar aktual (x, y) di dalam kanvas statis .xp-cam
      const coords = rawCoords.map((pt) => ({
        x: pt.x,
        y: pt.y + translateY,
      }))
      const headX = rawHeadX
      const headY = rawHeadY + translateY

      const allPtsStr = coords.map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ')
      basePoly.setAttribute('points', allPtsStr)
      basePoly.style.opacity = String(revealAfterLand)

      if (!hasStarted) {
        progPoly.setAttribute('points', '')
      } else {
        const activeCoords = coords
          .slice(0, i0 + 1)
          .map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
        if (frac > 0.0005) {
          activeCoords.push(`${headX.toFixed(2)},${headY.toFixed(2)}`)
        }
        progPoly.setAttribute('points', activeCoords.join(' '))
      }

      // Setiap simpul <g> (titik + teks) berada di koordinat (x, y) yang 100% identik dengan sudut polyline
      for (let i = 0; i < n; i += 1) {
        const nodeG = svgNodeRefs.current[i]
        const dotG = svgDotRefs.current[i]
        const tagG = tagRefs.current[i]
        const prevBtn = prevBtnRefs.current[i]
        const card = cardRefs.current[i]
        const stepBtn = stepBtnRefs.current[i]

        const reached = hasStarted && (f >= i - 0.004 || ov > 0.6)
        const isCurrent = hasStarted && i === activeCardIdx

        if (nodeG) {
          nodeG.setAttribute(
            'transform',
            `translate(${coords[i].x.toFixed(2)}, ${coords[i].y.toFixed(2)})`,
          )
          nodeG.style.pointerEvents = isMobile ? (reached ? 'auto' : 'none') : 'auto'
        }

        if (dotG) {
          dotG.classList.toggle('on', reached)
          dotG.classList.toggle('current', isCurrent)
          const baseScale = isMobile ? 0.88 : 1
          const pulse = (isCurrent ? 1.18 : reached ? 1.0 : 0.92) * baseScale
          dotG.setAttribute('transform', `scale(${pulse.toFixed(3)})`)
          // Seluruh titik (termasuk titik 5..8 yang mengulang warna) baru muncul BERSAMAAN
          // ketika kartu Work sudah menempati titik (flightP >= 0.92)
          const dotVis = seg(flightP, 0.92, 0.99)
          dotG.style.opacity = String(dotVis)
        }

        if (tagG) {
          const left = i % 2 === 0
          const dx = isMobile ? (left ? -14 : 14) : left ? -18 : 18
          tagG.setAttribute('transform', `translate(${dx}, 0)`)
          const baseOp = ov > 0.5 ? 1 : isCurrent ? 1 : reached ? 0.88 : 0.42
          const op = baseOp * revealAfterLand * (1 - seg(q, 0, 0.4))
          tagG.setAttribute('opacity', op.toFixed(3))

          const dateEl = tagG.querySelector('.xp-svg-date')
          const titleEls = tagG.querySelectorAll('.xp-svg-title')
          const multi = titleEls.length > 1
          if (dateEl) {
            dateEl.setAttribute('y', String(isMobile ? (multi ? -12 : -5.5) : multi ? -16 : -8))
          }
          titleEls.forEach((tEl, lIdx) => {
            const yVal = isMobile
              ? multi
                ? lIdx === 0
                  ? 3
                  : 17.5
                : 9.5
              : multi
                ? lIdx === 0
                  ? 2.5
                  : 21
                : 11
            tEl.setAttribute('y', String(yVal))
          })
        }

        if (prevBtn) {
          const showPrev = isMobile && reached && revealAfterLand > 0.6
          prevBtn.setAttribute('opacity', showPrev ? '1' : '0')
          prevBtn.style.display = showPrev ? '' : 'none'
        }

        if (card) {
          const isTarget = i === activeCardIdx
          const vis = (isTarget ? 1 : 0) * revealAfterLand
          card.style.opacity = String(vis)
          card.style.transform = `translate3d(0, ${((1 - vis) * 8).toFixed(1)}px, 0) scale(${(0.98 + 0.02 * vis).toFixed(3)})`
          card.style.visibility = vis > 0.03 ? 'visible' : 'hidden'
          card.style.pointerEvents = vis > 0.55 ? 'auto' : 'none'
        }

        if (stepBtn) {
          stepBtn.classList.toggle('is-active', i === activeCardIdx)
        }
      }

      // Header seksi & panel kartu hanya muncul setelah kartu Work menempati titik,
      // lalu memudar di fase outro saat jalur zigzag bersiap menjadi garis tabel Services.
      const outroFade = 1 - seg(q, 0, 0.4)
      const headerEl = stage.querySelector('[data-xp-header]')
      if (headerEl) {
        const hv = revealAfterLand * outroFade
        headerEl.style.opacity = String(hv)
        headerEl.style.transform = `translate3d(0, ${((1 - revealAfterLand) * 14).toFixed(1)}px, 0)`
      }
      const panel = stage.querySelector('[data-xp-panel]')
      if (panel) panel.style.opacity = String(revealAfterLand * outroFade)
      const stepsBar = stage.querySelector('[data-xp-steps]')
      if (stepsBar) stepsBar.style.opacity = String(revealAfterLand * outroFade)
      world.style.transform =
        q > 0 ? `perspective(900px) rotateX(${(20 * Math.sin(Math.PI * q)).toFixed(2)}deg)` : ''
    }

    renderFnRef.current = render
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', render)
    }
    render()
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', render)
      }
    }
  }, [lang, n, items, selectedIdx])

  useLayoutEffect(() => {
    if (renderFnRef.current) renderFnRef.current()
  })

  /** Klik titik atau nomor step pada desktop → scroll langsung ke titik tersebut pada jalur */
  const jumpToPoint = (idx) => {
    const wrap = wrapRef.current
    if (!wrap) return
    setSelectedIdx(idx)
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
    const introLen = (INTRO_VH / 100) * vh
    const outroLen = (OUTRO_VH / 100) * vh
    const total = Math.max(1, wrap.offsetHeight - vh - introLen - outroLen)
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY
    const targetP = (idx / (n - 1)) * 0.84
    window.scrollTo({
      top: Math.round(wrapTop + introLen + total * targetP),
      behavior: 'smooth',
    })
  }

  /** Klik titik/label/tombol Preview: pada mobile membuka modal popup, pada desktop scroll ke titik */
  const handlePointClick = (idx) => {
    const isMobile = window.matchMedia('(max-width: 820px)').matches
    setSelectedIdx(idx)
    if (isMobile) {
      setModalIdx(idx)
    } else {
      jumpToPoint(idx)
    }
  }

  const modalItem = modalIdx !== null ? items[modalIdx] : null
  const modalTone = modalIdx !== null ? TONES[modalIdx % TONES.length] : TONES[0]

  // Kunci scroll halaman saat modal pengalaman terbuka di mobile
  useEffect(() => {
    if (modalIdx === null) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [modalIdx])

  return (
    <div
      id="experience"
      ref={wrapRef}
      className="relative md:mb-6 max-md:-mb-28"
      style={{ height: `${n * 56 + 50 + INTRO_VH + OUTRO_VH}vh` }}
    >
      <div ref={stageRef} className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        {/* Header seksi: dipisahkan di baris atas tersendiri agar jalur zigzag tidak pernah menabrak judul */}
        <div
          data-xp-header
          className="mx-auto w-full max-w-[1300px] shrink-0 px-7 pt-[74px] pb-3 max-md:px-5 max-md:pt-[54px] max-md:pb-1.5"
          style={{ opacity: 0 }}
        >
          <small className="block max-md:text-[10px]">{t.experience.label}</small>
          <h2 className="disp mt-2 text-[clamp(42px,5.8vw,86px)] max-md:mt-0.5 max-md:text-[clamp(28px,8.5vw,40px)]">
            {t.experience.heading}
            {t.experience.headingAccent ? (
              <>
                {' '}
                <span className="serif text-pri normal-case">{t.experience.headingAccent}</span>
              </>
            ) : null}
          </h2>
        </div>

        {/* Area utama di bawah header */}
        <div className="relative min-h-0 flex-1 w-full">
          {/* Area kamera jalur zigzag 2D:
              Di mobile membentang penuh karena kartu preview ditampilkan sebagai modal popup */}
          <div
            ref={camRef}
            className="xp-cam absolute inset-y-0 left-0 right-[46%] z-[1] overflow-hidden max-md:right-0"
          >
            <div
              ref={worldRef}
              className="xp-world relative mx-auto h-full w-[min(480px,84%)] max-md:w-full max-md:max-w-[390px]"
            >
              <svg
                ref={svgRef}
                className=" absolute left-0 top-0 block overflow-visible select-none"
              >
                {/* Garis dasar zigzag 2D (belum dilewati) */}
                <polyline
                  ref={basePolyRef}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.22"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
                {/* Garis progres aktif putih 2D */}
                <polyline
                  ref={progPolyRef}
                  fill="none"
                  className="pointer-events-none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Setiap simpul (titik + teks tanggal + judul + tombol Preview) digambar di dalam satu <g>
                    dengan titik pusat (0, 0) tepat di sudut garis, sehingga 100% sejajar di semua kondisi */}
                {items.map((it, i) => {
                  const left = i % 2 === 0
                  const lines = splitTitleLines(it.title)
                  const multi = lines.length > 1
                  const anchor = left ? 'end' : 'start'

                  return (
                    <g
                      key={`${lang}-svg-node-${i}`}
                      ref={(el) => {
                        svgNodeRefs.current[i] = el
                      }}
                      className="xp-svg-node cursor-pointer"
                      onClick={() => handlePointClick(i)}
                    >
                      {/* Area sentuh/klik mencakup titik dan blok teks */}
                      <rect
                        x={left ? -155 : -16}
                        y={multi ? -26 : -20}
                        width="171"
                        height={multi ? 60 : 46}
                        fill="transparent"
                      />

                      {/* Lingkaran titik tepat di (0, 0) dengan warna sesuai urutan 4 kartu Work */}
                      <g
                        ref={(el) => {
                          svgDotRefs.current[i] = el
                        }}
                        className="xp-svg-dot"
                        style={{ '--dot-color': TONES[i % TONES.length].dot }}
                      >
                        <circle className="xp-dot-glow" r="14" />
                        <circle className="xp-dot-bg" r="9.5" />
                        <circle className="xp-dot-core" r="6.5" />
                      </g>

                      {/* Grup teks poin: berpusat vertikal terhadap (0, 0) */}
                      <g
                        ref={(el) => {
                          tagRefs.current[i] = el
                        }}
                        className={`xp-svg-tag ${left ? 'is-left' : 'is-right'}`}
                        textAnchor={anchor}
                      >
                        <text
                          className="xp-svg-date"
                          y={multi ? -11 : -4.5}
                        >
                          {it.date.toUpperCase()}
                        </text>
                        {lines.map((line, lIdx) => (
                          <text
                            key={lIdx}
                            className="xp-svg-title"
                            y={multi ? (lIdx === 0 ? 3 : 17) : 9.5}
                          >
                            {line}
                          </text>
                        ))}
                        <text
                          ref={(el) => {
                            prevBtnRefs.current[i] = el
                          }}
                          className="xp-svg-prev"
                          y={multi ? 29 : 21.5}
                          opacity="0"
                          style={{ display: 'none' }}
                        >
                          {`[ ${t.experience.previewLabel.toUpperCase()} ↗ ]`}
                        </text>
                      </g>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Kartu preview pengalaman khusus Desktop (di mobile menggunakan modal popup) */}
          <div
            data-xp-panel
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] flex w-[47%] items-center pr-7 pl-2 max-md:hidden"
          >
            <div className="relative grid grid-cols-1 grid-rows-1 w-full max-w-[500px]">
              {items.map((it, i) => {
                const tone = TONES[i % TONES.length]
                return (
                  <article
                    key={`${lang}-card-${i}`}
                    ref={(el) => {
                      cardRefs.current[i] = el
                    }}
                    className={`xp-card col-start-1 row-start-1 w-full overflow-hidden rounded-[28px] transition-[opacity,transform] duration-200 ${tone.card}`}
                    style={{ opacity: 0, visibility: 'hidden' }}
                  >
                    {/* Foto Landscape 16:9 full-bleed di bagian atas */}
                    <div
                      className={`xp-photo relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b ${tone.divider} ${tone.photoBg}`}
                    >
                      {/* Label kategori di pojok kiri atas foto */}
                      <span
                        className={`absolute top-3.5 left-3.5 z-10 rounded-pill px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.08em] uppercase ${tone.tag}`}
                      >
                        {it.type}
                      </span>

                      {it.img ? (
                        <img
                          src={it.img}
                          alt={it.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="xp-photo-placeholder absolute inset-0 flex flex-col items-center justify-center p-4">
                          {/* Viewfinder corner bracket kanan atas */}
                          <span className="pointer-events-none absolute top-3.5 right-3.5 h-3.5 w-3.5 border-t-2 border-r-2 border-current opacity-40" />
                          <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.14em] uppercase opacity-75">
                            <svg
                              className="h-4 w-4 stroke-current"
                              viewBox="0 0 24 24"
                              fill="none"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                            <span>[ {t.experience.photoPlaceholder || 'Foto Dokumentasi'} ]</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strip overlap: Judul utama di kiri & Angka Indeks Anton di kanan sama-sama memotong batas foto (50% di atas garis, 50% di bawah garis) */}
                    <div className="relative z-[2] -mt-7 flex items-center justify-between gap-3 px-6">
                      <h3 className="disp min-w-0 flex-1 text-[clamp(26px,2.6vw,36px)] leading-[0.92] tracking-[-0.01em]">
                        {it.title}
                      </h3>
                      <span className="disp shrink-0 select-none text-[clamp(56px,5.2vw,74px)] leading-[0.76] tracking-[-0.03em]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Badan Konten Editorial */}
                    <div className="px-6 pt-2 pb-5">
                      {/* Baris subjudul organisasi sejajar dengan tanggal */}
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`serif min-w-0 flex-1 text-[18.5px] leading-[1.18] italic ${tone.sub}`}>
                          {it.org}
                        </p>
                        <span className="shrink-0 font-mono text-[11px] font-bold tracking-[0.08em] uppercase opacity-75">
                          {it.date}
                        </span>
                      </div>
                      <div className={`my-3 border-t ${tone.divider}`} />
                      <p className="text-[12.5px] leading-[1.62] opacity-90">{it.desc}</p>
                      <div className={`mt-4 flex items-center justify-between border-t ${tone.divider} pt-3`}>
                        <span className="font-mono text-[11px] font-bold tracking-[0.1em] opacity-75">
                          [ {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} ]
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => jumpToPoint((i - 1 + n) % n)}
                            aria-label="Previous experience"
                            className={`cursor-pointer rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-bold transition-colors ${tone.navBtn}`}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => jumpToPoint((i + 1) % n)}
                            aria-label="Next experience"
                            className={`cursor-pointer rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-bold transition-colors ${tone.navBtn}`}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup Preview khusus Mobile (muncul saat titik/label/tombol Preview diklik).
          Di-portal ke document.body dengan z-[200] agar menutup seluruh halaman termasuk nav, translate, dan logo. */}
      {modalItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalItem.title}
            onClick={() => setModalIdx(null)}
            className="fixed inset-0 z-[200] hidden items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md max-md:flex"
          >
            <article
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[400px] overflow-hidden rounded-[26px] ${modalTone.card}`}
            >
              {/* Foto Landscape 16:9 full-bleed di bagian atas */}
              <div
                className={`xp-photo relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b ${modalTone.divider} ${modalTone.photoBg}`}
              >
                {/* Label kategori di pojok kiri atas foto */}
                <span
                  className={`absolute top-3 left-3 z-10 rounded-pill px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${modalTone.tag}`}
                >
                  {modalItem.type}
                </span>

                {/* Floating Close Button */}
                <button
                  type="button"
                  onClick={() => setModalIdx(null)}
                  aria-label={t.experience.closeLabel}
                  className="absolute top-3 right-3 z-10 cursor-pointer rounded-pill border border-white/30 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] text-white uppercase backdrop-blur-md transition-colors hover:bg-black/70"
                >
                  [ ✕ ]
                </button>

                {modalItem.img ? (
                  <img
                    src={modalItem.img}
                    alt={modalItem.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="xp-photo-placeholder absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.14em] uppercase opacity-75">
                      <svg
                        className="h-4 w-4 stroke-current"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span>[ {t.experience.photoPlaceholder || 'Foto Dokumentasi'} ]</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Strip overlap: Judul di kiri & Angka Indeks Anton di kanan memotong batas foto */}
              <div className="relative z-[2] -mt-5 flex items-center justify-between gap-2.5 px-5">
                <h3 className="disp min-w-0 flex-1 text-[24px] leading-[0.96] tracking-[-0.01em]">
                  {modalItem.title}
                </h3>
                <span className="disp shrink-0 select-none text-[52px] leading-[0.76] tracking-[-0.03em]">
                  {String(modalIdx + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Konten Editorial Modal */}
              <div className="px-5 pt-2 pb-5">
                {/* Baris subjudul organisasi sejajar dengan tanggal */}
                <div className="flex items-baseline justify-between gap-2.5">
                  <p className={`serif min-w-0 flex-1 text-[17px] leading-[1.18] italic ${modalTone.sub}`}>
                    {modalItem.org}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.08em] uppercase opacity-75">
                    {modalItem.date}
                  </span>
                </div>
                <div className={`my-2.5 border-t ${modalTone.divider}`} />
                <p className="text-[12px] leading-[1.6] opacity-90">{modalItem.desc}</p>
                <div className={`mt-3.5 flex items-center justify-between border-t ${modalTone.divider} pt-2.5`}>
                  <span className="font-mono text-[10px] font-bold tracking-[0.1em] opacity-75">
                    [ {String(modalIdx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} ]
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const prev = (modalIdx - 1 + n) % n
                        setSelectedIdx(prev)
                        setModalIdx(prev)
                      }}
                      aria-label="Previous"
                      className={`cursor-pointer rounded-pill border px-2.5 py-0.5 font-mono text-[10px] font-bold transition-colors ${modalTone.navBtn}`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (modalIdx + 1) % n
                        setSelectedIdx(next)
                        setModalIdx(next)
                      }}
                      aria-label="Next"
                      className={`cursor-pointer rounded-pill border px-2.5 py-0.5 font-mono text-[10px] font-bold transition-colors ${modalTone.navBtn}`}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>,
          document.body
        )}
    </div>
  )
}
