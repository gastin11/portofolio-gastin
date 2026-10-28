import { useEffect, useRef } from 'react'
import { clamp01, lerp, smooth, reducedMotion } from '../../motion/gsap.js'

const DOT_COLORS = ['var(--pri)', 'var(--lime)', 'var(--lilac)', 'var(--peach)']

/**
 * Transisi Experience → Services:
 * Setelah outro Experience selesai, garis zigzag merah beserta 8 titik berwarna
 * diluruskan menuju garis lurus horizontal (border-top .svc-table) selagi
 * seksi #services sudah terkunci (sticky) di layar (tuntas di p = 0.20 #services,
 * tepat sebelum judul Services muncul).
 */
export default function LineToTable({ deps }) {
  const svgRef = useRef(null)
  const polyRef = useRef(null)
  const dotsRef = useRef([])
  const expCount = deps?.experience?.items?.length || 8

  useEffect(() => {
    const exp = document.getElementById('experience')
    const svc = document.getElementById('services')
    const table = document.querySelector('.svc-table')
    const svg = svgRef.current
    const poly = polyRef.current
    if (!exp || !svc || !table || !svg || !poly) return undefined
    const root = document.documentElement

    const render = () => {
      if (reducedMotion()) {
        table.style.setProperty('--svc-line', '1')
        svg.style.visibility = 'hidden'
        delete root.dataset.xpLine
        return
      }

      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      const expRect = exp.getBoundingClientRect()
      const svcRect = svc.getBoundingClientRect()
      const svcTotal = Math.max(1, svc.offsetHeight - vh)

      // Mulai saat stage Experience hampir lepas (expRect.bottom = vh + 0.12vh)
      // Selesai saat #services mencapai p = 0.22 di dalam sticky stage-nya
      const startScroll = expRect.bottom + window.scrollY - vh * 1.12
      const endScroll = svcRect.top + window.scrollY + svcTotal * 0.22
      const t = clamp01((window.scrollY - startScroll) / Math.max(1, endScroll - startScroll))

      const dots = document.querySelectorAll('.xp-svg-dot')
      const n = dots.length
      table.style.setProperty('--svc-line', t >= 1 ? '1' : '0')

      if (t <= 0 || t >= 1 || !n) {
        svg.style.visibility = 'hidden'
        delete root.dataset.xpLine
        return
      }

      const pushUp = Math.max(0, vh - expRect.bottom)
      const tr = table.getBoundingClientRect()
      const e = smooth(t)
      const ly = tr.top + 0.75
      const pts = []

      dots.forEach((dot, i) => {
        const d = dot.getBoundingClientRect()
        const sx = d.left + d.width / 2
        const sy = d.top + d.height / 2 + pushUp
        const tx = tr.left + (i / (n - 1)) * tr.width
        const x = lerp(sx, tx, e)
        const y = lerp(sy, ly, e)
        pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
        const c = dotsRef.current[i]
        if (c) {
          c.setAttribute('cx', x)
          c.setAttribute('cy', y)
          c.setAttribute('r', (6.5 * (1 - e)).toFixed(2))
        }
      })

      poly.setAttribute('points', pts.join(' '))
      poly.style.strokeWidth = String(lerp(3.5, 1.5, e))
      poly.style.stroke = `color-mix(in srgb, #ffffff ${Math.round((1 - e) * 100)}%, var(--ink))`
      svg.style.visibility = 'visible'
      root.dataset.xpLine = '1'
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      delete root.dataset.xpLine
      table.style.removeProperty('--svc-line')
    }
  }, [deps])

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-[3] h-full w-full"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    >
      <polyline
        ref={polyRef}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {Array.from({ length: expCount }, (_, i) => (
        <circle
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el
          }}
          r="0"
          fill={DOT_COLORS[i % DOT_COLORS.length]}
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
