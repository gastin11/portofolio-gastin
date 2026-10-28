import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const seg = (p, a, b) => clamp01((p - a) / (b - a))
export const ez = (x) => 1 - (1 - x) ** 3
export const smooth = (x) => x * x * (3 - 2 * x)
export const lerp = (a, b, t) => a + (b - a) * t

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobile = () => window.matchMedia('(max-width: 820px)').matches

/**
 * Pasang trigger murni-progres (tanpa pin, tanpa smoothing waktu) pada `trigger`.
 * `render(progress 0-1)` menulis inline style; dipanggil juga sekali di awal.
 * Dengan prefers-reduced-motion, progres dipinned ke 1 (kondisi akhir).
 * Mengembalikan fungsi pembersih.
 */
export function trackProgress(trigger, { start, end }, render) {
  if (!trigger) return () => {}
  if (reducedMotion()) {
    render(1)
    return () => {}
  }
  const st = ScrollTrigger.create({
    trigger,
    start,
    end,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  })
  render(st.progress)
  return () => st.kill()
}

if (typeof window !== 'undefined') {
  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('resize', refresh)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
}
