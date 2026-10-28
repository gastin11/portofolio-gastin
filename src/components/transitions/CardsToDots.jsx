import { useEffect, useRef } from 'react'
import { clamp01, seg, smooth, lerp, isMobile, reducedMotion } from '../../motion/gsap.js'

const DOT = 14
const TILT = 25
const INTRO_VH = 44

/**
 * Transisi Work → Experience: klon keempat kartu proyek menyusut, sedikit
 * miring di sumbu Y (maks 25°), membulat, lalu mendarat di 4 titik pertama
 * jalur Experience dengan warna yang persis sama (Biru, Lime, Lilac, Peach).
 * Selesai di r.top = -0.55 * introLen (di dalam sticky Experience), tepat
 * sebelum judul Experience dan card preview muncul.
 */
export default function CardsToDots({ deps }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const exp = document.getElementById('experience')
    const work = document.getElementById('work')
    if (!host || !exp || !work) return undefined

    const scenes = Array.from(work.querySelectorAll('.pc-scene')).slice(0, 4)
    const ghosts = scenes.map((scene) => {
      const front = scene.querySelector('.pc-front')
      const g = front.cloneNode(true)
      g.removeAttribute('role')
      g.setAttribute('aria-hidden', 'true')
      g.style.cssText =
        'position:fixed;z-index:4;left:0;top:0;margin:0;pointer-events:none;display:none;transform-origin:center;will-change:transform;border:1.5px solid var(--ink)'
      g.querySelectorAll('[class]').forEach((n) => {
        n.style.opacity = ''
      })
      host.appendChild(g)
      return g
    })

    const render = () => {
      if (reducedMotion()) {
        scenes.forEach((s) => {
          s.style.opacity = ''
        })
        ghosts.forEach((g) => {
          g.style.display = 'none'
        })
        return
      }

      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      const introLen = (INTRO_VH / 100) * vh
      const r = exp.getBoundingClientRect()
      const flightStart = vh * 0.92
      const flightEnd = -introLen * 0.45
      const p = clamp01((flightStart - r.top) / (flightStart - flightEnd))

      const dots = document.querySelectorAll('.xp-svg-dot')
      const active = p > 0.001 && p < 1
      const rad = isMobile() ? 32 : 44

      scenes.forEach((scene, i) => {
        const g = ghosts[i]
        scene.style.opacity = p > 0.001 ? '0' : ''
        const dot = dots[i]
        if (!active || !dot) {
          g.style.display = 'none'
          return
        }
        const s = scene.getBoundingClientRect()
        const d = dot.getBoundingClientRect()

        // Kompensasi pergeseran scroll (flightStart - r.top) pada kartu dan Math.max(0, r.top)
        // pada titik sehingga selama transisi berlangsung (baik maju maupun reverse),
        // keempat kartu langsung mengembang mengisi layar yang ditinggalkan Experience
        // (tidak terbang ke atas keluar layar) dan berhimpit 100% pas saat mendarat di p = 0.
        const landingCy = s.top + s.height / 2 + (flightStart - r.top)
        const pinnedDotCy = d.top + d.height / 2 - Math.max(0, r.top)

        const localP = seg(p, i * 0.04, 0.88 + i * 0.04)
        const e = smooth(localP)
        const w = lerp(s.width, DOT, e)
        const h = lerp(s.height, DOT, e)
        const cx = lerp(s.left + s.width / 2, d.left + d.width / 2, e)
        const cy = lerp(landingCy, pinnedDotCy, e)
        const rot = (i % 2 === 0 ? 1 : -1) * TILT * Math.sin(Math.PI * e)
        const content = 1 - seg(localP, 0, 0.52)

        g.style.display = ''
        g.style.width = `${w}px`
        g.style.height = `${h}px`
        g.style.borderRadius = `${lerp(rad, DOT / 2, e)}px`
        g.style.padding = e > 0.2 ? '0' : ''
        g.style.opacity = String(1 - seg(p, 0.92, 1))
        g.style.transform = `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) perspective(900px) rotateY(${rot}deg)`
        Array.from(g.children).forEach((k) => {
          k.style.opacity = String(content)
        })
      })
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      scenes.forEach((s) => {
        s.style.opacity = ''
      })
      ghosts.forEach((g) => g.remove())
    }
  }, [deps])

  return <div ref={hostRef} className="pointer-events-none z-[4]" aria-hidden="true" />
}
