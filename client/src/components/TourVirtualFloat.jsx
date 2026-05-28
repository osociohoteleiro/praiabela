import { useState, useEffect } from 'react'
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const tourUrl = 'https://tourmkr.com/F1biwwjN1X/46253449p&346.86h&78.42t&autorotate=true'

const TourVirtualFloat = () => {
  const [scrolledEnough, setScrolledEnough] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Show after 30% scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const ratio = scrolled / max
      setScrolledEnough(ratio >= 0.3)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const playerVisible = scrolledEnough && !dismissed

  // Broadcast player visibility for other floats (e.g. WhatsApp) to reposition
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('tourFloatVisible', { detail: playerVisible })
    )
  }, [playerVisible])

  // ESC closes expanded view
  useEffect(() => {
    if (!expanded) return
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [expanded])

  const reopen = () => {
    setDismissed(false)
    setScrolledEnough(true)
  }

  return (
    <>
      {/* Mini player — fixed bottom-right, slides up on scroll */}
      <div
        className={`fixed bottom-24 lg:bottom-6 right-6 z-40 w-80 max-w-[calc(100vw-3rem)] rounded-xl overflow-hidden shadow-2xl bg-black border border-white/20 transition-all duration-500 ease-out ${
          playerVisible && !expanded
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-warm text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GlobeAltIcon className="w-4 h-4" />
            <span>Tour Virtual 360°</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(true)}
              aria-label="Expandir tour"
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Fechar tour"
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Iframe (only mount when player is visible to avoid loading until needed) */}
        <div className="relative w-full aspect-video bg-black">
          {playerVisible && (
            <iframe
              src={tourUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; gyroscope; vr; xr"
              title="Tour Virtual 360° - Pousada Praia Bela"
            />
          )}
        </div>
      </div>

      {/* Reopen pill — discreet, shown only when dismissed (and page scrolled) */}
      <button
        onClick={reopen}
        aria-label="Reabrir Tour Virtual 360°"
        title="Reabrir Tour Virtual 360°"
        className={`fixed bottom-44 lg:bottom-24 right-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 hover:bg-white text-primary-600 shadow-lg ring-1 ring-black/5 hover:scale-110 transition-all duration-300 ${
          dismissed && scrolledEnough
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <GlobeAltIcon className="w-5 h-5" />
      </button>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative w-full max-w-6xl h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(false)}
              aria-label="Reduzir tour"
              className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <ArrowsPointingInIcon className="w-5 h-5" />
            </button>
            <iframe
              src={tourUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; gyroscope; vr; xr"
              title="Tour Virtual 360° - Pousada Praia Bela (expandido)"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default TourVirtualFloat
