import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal Popup Editorial untuk Pratinjau & Unduh CV Gastin Alfiansa.
 *
 * Fitur:
 * - Pratinjau dokumen PDF langsung via embedded viewer interaktif.
 * - Tombol unduh langsung (atribut download) di header & footer.
 * - Tombol buka di tab baru (fallback untuk browser mobile yang membatasi iframe PDF).
 * - Animasi masuk/keluar halus mengikuti styling editorial site (menggunakan .cta-modal-*).
 * - Aksesibilitas penuh: role="dialog", aria-modal, penutup tombol ESC, dan penguncian scroll latar.
 */
export default function CvModal({ isOpen, onClose, cvHref, cvData }) {
  const [modalStage, setModalStage] = useState('closed') // 'closed' | 'opening' | 'open' | 'closing'
  const [isDownloading, setIsDownloading] = useState(false)
  const closeTimerRef = useRef(null)
  const rafRef = useRef(null)

  const handleDownload = async (e) => {
    if (e) e.preventDefault()
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const response = await fetch(cvHref)
      if (!response.ok) throw new Error('Fetch failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = blobUrl
      a.download = cvData?.fileName || 'Gastin-Alfiansa-CV.pdf'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
        setIsDownloading(false)
      }, 250)
    } catch (err) {
      console.error('Download error:', err)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = cvHref
      a.download = cvData?.fileName || 'Gastin-Alfiansa-CV.pdf'
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a)
        setIsDownloading(false)
      }, 250)
    }
  }

  const reducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      if (reducedMotion()) {
        setModalStage('open')
        return undefined
      }
      setModalStage('opening')
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          setModalStage('open')
        })
      })
    } else if (modalStage === 'open' || modalStage === 'opening') {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (reducedMotion()) {
        setModalStage('closed')
        return undefined
      }
      setModalStage('closing')
      closeTimerRef.current = window.setTimeout(() => {
        setModalStage('closed')
        closeTimerRef.current = null
      }, 160)
    }

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [isOpen])

  // Kunci scroll halaman & dengarkan tombol Escape tanpa layout thrashing
  const isModalActive = modalStage !== 'closed'
  useEffect(() => {
    if (!isModalActive) return undefined

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isModalActive, onClose])

  if (modalStage === 'closed' || !cvData) return null

  return createPortal(
    <div
      className={`cv-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 overscroll-contain max-md:p-4 max-md:py-6 ${
        modalStage === 'open' ? 'is-open' : modalStage === 'closing' ? 'is-closing' : ''
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
    >
      <div
        className="cv-modal-card relative flex flex-col w-full max-w-[960px] h-[88vh] max-h-[920px] overflow-hidden rounded-[24px] border border-ink/15 bg-bg text-left text-ink shadow-[0_20px_50px_rgba(0,0,0,0.5)] overscroll-contain max-md:w-full max-md:h-[82dvh] max-md:max-h-[660px] max-md:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Top Bar Editorial — Header Modal */}
        <div className="flex shrink-0 items-center justify-between bg-pri px-6 py-3.5 text-white max-md:px-4 max-md:py-2.5">
          <h3
            id="cv-modal-title"
            className="disp text-[clamp(19px,4.5vw,26px)] leading-none text-white tracking-tight flex items-baseline gap-1.5 select-none"
          >
            <span>{cvData.title}</span>
            <span className="serif font-normal text-lime italic normal-case text-[1.12em]">
              {cvData.titleAccent}
            </span>
          </h3>

          {/* Tombol Tutup Modal */}
          <button
            type="button"
            onClick={onClose}
            aria-label={cvData.close}
            className="cursor-pointer rounded-pill border border-white/25 bg-white/10 px-3 py-1 font-mono text-[11px] font-bold tracking-[0.06em] text-white transition-all hover:border-brand hover:bg-brand hover:text-white active:scale-95 min-h-[36px] min-w-[42px] flex items-center justify-center touch-manipulation"
          >
            [ ✕ ]
          </button>
        </div>

        {/* Container Dokumen — Native High-Res Multi-page Viewer */}
        <div
          className="relative flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#161619] p-4 max-md:p-2.5"
          style={{ contain: 'content', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 max-md:gap-3">
            {/* Halaman 1 */}
            <div className="w-full overflow-hidden rounded-[8px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <picture>
                <source srcSet="/cv/page-1.webp" type="image/webp" />
                <img
                  src="/cv/page-1.png"
                  alt="Curriculum Vitae Gastin Alfiansa - Halaman 1"
                  className="block h-auto w-full select-none"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>

            {/* Halaman 2 */}
            <div className="w-full overflow-hidden rounded-[8px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <picture>
                <source srcSet="/cv/page-2.webp" type="image/webp" />
                <img
                  src="/cv/page-2.png"
                  alt="Curriculum Vitae Gastin Alfiansa - Halaman 2"
                  className="block h-auto w-full select-none"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Bottom Bar Editorial — Footer Modal (Section Footer dengan Tombol Unduh) */}
        <div className="flex shrink-0 items-center justify-end border-t border-ink/10 bg-bg px-6 py-2.5 text-ink max-md:px-4 max-md:py-2.5">
          {/* Tombol Unduh CV: aktif di footer untuk desktop dan mobile */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill bg-pri px-4 py-1.5 font-mono text-[11.5px] font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 touch-manipulation shadow-sm"
          >
            {isDownloading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span>{cvData.downloading || 'Mengunduh...'}</span>
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{cvData.download || 'Unduh CV ↓'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
