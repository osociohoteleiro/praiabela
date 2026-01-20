import { useState, useRef, useEffect } from 'react'

const Hero = () => {
  const tourUrl = 'https://tourmkr.com/F1biwwjN1X/46253449p&346.86h&78.42t&autorotate=true'
  const [isInteracting, setIsInteracting] = useState(false)
  const timeoutRef = useRef(null)

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const startInteraction = () => {
    setIsInteracting(true)
    // Dispatch event to hide navbar
    window.dispatchEvent(new CustomEvent('tourInteraction', { detail: true }))

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const exitTour = () => {
    setIsInteracting(false)
    window.dispatchEvent(new CustomEvent('tourInteraction', { detail: false }))
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Tour Virtual 360° Background */}
      <iframe
        src={tourUrl}
        className={`absolute inset-0 w-full h-full border-0 ${isInteracting ? 'z-[60]' : 'z-0'}`}
        allowFullScreen
        allow="accelerometer; gyroscope; vr; xr"
        title="Tour Virtual 360° - Pousada Praia Bela"
      />

      {/* Content - clicável para iniciar interação */}
      <div
        className={`absolute inset-0 flex items-center justify-center text-center px-4 z-10 cursor-pointer transition-opacity duration-300 ${
          isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={startInteraction}
      >
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-bold mb-6 animate-slide-down drop-shadow-lg">
            Pousada Praia Bela
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 font-light animate-slide-up drop-shadow-md">
            Seu paraíso em Ilhéus, Bahia
          </p>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up drop-shadow-md" style={{ animationDelay: '0.2s' }}>
            Acomodações confortáveis à beira-mar com o melhor do litoral baiano
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                scrollToBooking()
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Reserve Agora
            </button>
            <a
              href="#about"
              onClick={(e) => e.stopPropagation()}
              className="btn-secondary text-lg px-8 py-4"
            >
              Conheça Mais
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-[15] transition-opacity duration-300 ${
          isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>

      {/* Botão Sair do Tour */}
      <button
        onClick={exitTour}
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[70] bg-white/90 hover:bg-white text-gray-800 font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 ${
          isInteracting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Sair do Tour
      </button>
    </div>
  )
}

export default Hero
