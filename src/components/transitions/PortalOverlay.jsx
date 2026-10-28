import { useEffect, useRef } from 'react'
import { clamp01, ez, lerp, reducedMotion } from '../../motion/gsap.js'

/**
 * Transisi Hero → About:
 * Lingkaran --dark tumbuh dari pusat foto hero hingga menutupi layar
 * bersamaan dengan berpindahnya foto menuju #about-photo-slot.
 */
export default function PortalOverlay() {
  const svgRef = useRef(null)
  const circleRef = useRef(null)

  useEffect(() => {
    const about = document.getElementById('about')
    const svg = svgRef.current
    const circle = circleRef.current
    if (!about || !svg || !circle) return undefined
    const root = document.documentElement

    const render = () => {
      if (reducedMotion()) {
        svg.style.visibility = 'hidden'
        delete root.dataset.portalTop
        return
      }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const aboutRect = about.getBoundingClientRect()

      // Progres portal latar gelap (mulai tepat saat #about menyentuh bawah layar)
      const portalP = clamp01((vh - aboutRect.top) / vh)
      if (portalP <= 0 || portalP >= 1) {
        svg.style.visibility = 'hidden'
        delete root.dataset.portalTop
      } else {
        const pic = document.querySelector('.photo.pic')
        const pr = pic ? pic.getBoundingClientRect() : null
        const cx = pr ? pr.left + pr.width / 2 : vw / 2
        const cy = pr ? pr.top + pr.height / 2 : vh / 2
        const reach = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy))
        const r = lerp(0, reach, ez(portalP))
        svg.style.visibility = 'visible'
        circle.setAttribute('cx', cx)
        circle.setAttribute('cy', cy)
        circle.setAttribute('r', r)
        const coversTop = r >= Math.hypot(Math.max(cx, vw - cx), cy - 50)
        if (coversTop) root.dataset.portalTop = '1'
        else delete root.dataset.portalTop
      }
    }

    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
      delete root.dataset.portalTop
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    >
      <circle
        ref={circleRef}
        r="0"
        fill="var(--dark)"
        stroke="rgba(246,241,231,0.25)"
        strokeWidth="1"
      />
    </svg>
  )
}
