import { useEffect, useState } from 'react'
import { siteInfoAPI } from '../services/api'

const Hero = () => {
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    loadSiteInfo()
  }, [])

  const loadSiteInfo = async () => {
    try {
      const { data } = await siteInfoAPI.get()
      if (data.hero_video_url) {
        setVideoUrl(data.hero_video_url)
      }
    } catch (error) {
      console.error('Error loading site info:', error)
    }
  }

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      ) : (
        // Fallback gradient background
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-400 to-ocean-500"></div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl animate-fade-in">
          {/* Logo or Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-bold mb-6 animate-slide-down drop-shadow-lg">
            Pousada Praia Bela
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 font-light animate-slide-up drop-shadow-md">
            Seu paraíso em Ilhéus, Bahia
          </p>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up drop-shadow-md" style={{ animationDelay: '0.2s' }}>
            Acomodações confortáveis à beira-mar com o melhor do litoral baiano
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={scrollToBooking}
              className="btn-primary text-lg px-8 py-4"
            >
              Reserve Agora
            </button>
            <a
              href="#about"
              className="btn-secondary text-lg px-8 py-4"
            >
              Conheça Mais
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
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
    </div>
  )
}

export default Hero
