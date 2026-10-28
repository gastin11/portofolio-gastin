import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MIN_ZOOM = 0.75
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.25

/**
 * Modal Popup Editorial untuk Pratinjau & Unduh CV Gastin Alfiansa.
 *
 * Fitur:
 * - Pratinjau dokumen PDF langsung via embedded viewer interaktif beresolusi tinggi.
 * - Kontrol Zoom (Zoom In, Zoom Out, Reset 100%) di toolbar footer.
 * - Dukungan multi-interaksi: tombol klik, keyboard (+, -, 0), wheel (Ctrl+scroll), pinch-to-zoom (mobile touch), dan double-click/double-tap.
 * - Tombol unduh langsung (background fetch blob download) di footer modal.
 * - Animasi masuk/keluar halus mengikuti styling editorial site (menggunakan .cv-modal-*).
 * - Aksesibilitas penuh: role="dialog", aria-modal, penutup tombol ESC, dan penguncian scroll latar.
 */
export default function CvModal({ isOpen, onClose, cvHref, cvData }) {
  const [modalStage, setModalStage] = useState('closed') // 'closed' | 'opening' | 'open' | 'closing'
  const [isDownloading, setIsDownloading] = useState(false)
  const [zoom, setZoom] = useState(1) // 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2.0

  const closeTimerRef = useRef(null)
  const rafRef = useRef(null)
  const containerRef = useRef(null)
  const prevZoomRef = useRef(1)
  const touchDistRef = useRef(null)
  const initialZoomRef = useRef(1)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100))
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  const handleToggleZoom = () => {
    setZoom((prev) => (prev > 1 ? 1 : 1.5))
  }

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
      setZoom(1)
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

  // Pusatkan scroll horizontal saat zoom berubah dari 1 ke > 1
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (zoom > 1 && prevZoomRef.current <= 1) {
      const timer = setTimeout(() => {
        const maxScroll = container.scrollWidth - container.clientWidth
        if (maxScroll > 0) {
          container.scrollLeft = maxScroll / 2
        }
      }, 40)
      return () => clearTimeout(timer)
    }
    prevZoomRef.current = zoom
  }, [zoom])

  // Kunci scroll halaman, shortcut keyboard (ESC, +, -, 0)
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
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isModalActive, onClose, zoom])

  // Dukungan wheel zoom via Ctrl + scroll mouse
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isModalActive) return undefined

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          setZoom((prev) => Math.min(MAX_ZOOM, Math.round((prev + 0.15) * 100) / 100))
        } else {
          setZoom((prev) => Math.max(MIN_ZOOM, Math.round((prev - 0.15) * 100) / 100))
        }
      }
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [isModalActive])

  // Dukungan pinch-to-zoom pada layar sentuh (mobile)
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      touchDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      initialZoomRef.current = zoom
    }
  }

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchDistRef.current
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoomRef.current * factor))
      setZoom(Math.round(nextZoom * 20) / 20)
    }
  }

  const onTouchEnd = () => {
    touchDistRef.current = null
  }

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

        {/* Container Dokumen — Native High-Res Multi-page Viewer dengan Dukungan Zoom & Pan */}
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative flex-1 min-h-0 w-full overflow-auto bg-[#161619] p-4 max-md:p-2.5 select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex min-w-full w-max min-h-full justify-center">
            <div
              onDoubleClick={handleToggleZoom}
              title={
                zoom === 1
                  ? 'Klik ganda untuk memperbesar (150%)'
                  : 'Klik ganda untuk kembali ke ukuran asli (100%)'
              }
              className={`flex flex-col items-center gap-4 transition-[width,max-width] duration-200 ease-out max-md:gap-3 shrink-0 ${
                zoom === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'
              }`}
              style={{
                width: `${Math.round(zoom * 100)}%`,
                maxWidth: `${Math.round(760 * Math.max(1, zoom))}px`,
              }}
            >
              {/* Halaman 1 */}
              <div className="w-full overflow-hidden rounded-[8px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <picture>
                  <source srcSet="/cv/page-1.webp" type="image/webp" />
                  <img
                    src="/cv/page-1.png"
                    alt="Curriculum Vitae Gastin Alfiansa - Halaman 1"
                    className="block h-auto w-full select-none pointer-events-none"
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
                    className="block h-auto w-full select-none pointer-events-none"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Editorial — Footer Modal (Toolbar Zoom di Kiri, Unduh di Kanan) */}
        <div className="flex shrink-0 items-center justify-between border-t border-ink/10 bg-bg px-5 py-2.5 text-ink max-md:px-3.5 max-md:py-2">
          {/* Kontrol Zoom (Perkecil / Reset / Perbesar) */}
          <div
            className="flex items-center gap-0.5 rounded-pill border border-ink/15 bg-ink/[0.04] p-0.5 font-mono text-[11px] text-ink select-none shadow-xs"
            role="toolbar"
            aria-label="Kontrol Zoom Dokumen"
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              aria-label={cvData.zoomOut || 'Perkecil'}
              title={`${cvData.zoomOut || 'Perkecil'} (-)`}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-pri hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30 touch-manipulation"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleZoomReset}
              aria-label={cvData.zoomReset || 'Reset Zoom (100%)'}
              title={`${cvData.zoomReset || 'Reset Zoom'} (0)`}
              className="min-w-[42px] cursor-pointer rounded-full px-1.5 py-1 text-center font-mono text-[11px] font-bold text-ink transition-colors hover:bg-ink/10 hover:text-pri active:scale-95 touch-manipulation select-none"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              aria-label={cvData.zoomIn || 'Perbesar'}
              title={`${cvData.zoomIn || 'Perbesar'} (+)`}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-pri hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30 touch-manipulation"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Tombol Unduh CV: aktif di footer untuk desktop dan mobile */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill bg-pri px-4 py-1.5 font-mono text-[11.5px] font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 touch-manipulation shadow-sm"
          >
            {isDownloading ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
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
