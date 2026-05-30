const heroImageUrl = '/hero.jpg'

const Hero = () => {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImageUrl}')` }}
      />

      {/* Top gradient (helps navbar contrast) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-[5] pointer-events-none" />

      {/* Bottom/center gradient (helps text contrast) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 z-[5] pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-10">
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
    </div>
  )
}

export default Hero
