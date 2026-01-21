import { useRef, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { roomsAPI } from '../services/api'

// Componente de Slider de Imagens para cada quarto
const ImageSlider = ({ images, roomName }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const goToNext = (e) => {
    if (e) e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = (e) => {
    if (e) e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe && images.length > 1) {
      goToNext()
    }
    if (isRightSwipe && images.length > 1) {
      goToPrev()
    }
  }

  if (!images || images.length === 0) {
    return (
      <img
        src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"
        alt={roomName}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div
      className="relative w-full h-full group/slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Imagem atual */}
      <img
        src={images[currentIndex]}
        alt={`${roomName} - Foto ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        loading="lazy"
        draggable={false}
      />

      {/* Botões de navegação - visíveis no mobile, hover no desktop */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity duration-200 z-10"
            aria-label="Próxima foto"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* Indicadores de posição */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Rooms = () => {
  const scrollContainerRef = useRef(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const { data } = await roomsAPI.getAll()
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 360 + 24 // card width + gap
      const scrollAmount = cardWidth * 2 // scroll 2 cards at a time
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section id="rooms" className="section-padding bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Nossas Acomodações
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o quarto perfeito para sua estadia. Todos com ar-condicionado, WiFi e café da manhã incluído.
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum quarto disponível no momento.</p>
          </div>
        ) : (
          /* Slider Container */
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hidden md:block"
              aria-label="Anterior"
            >
              <ChevronLeftIcon className="w-6 h-6 text-primary-500" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hidden md:block"
              aria-label="Próximo"
            >
              <ChevronRightIcon className="w-6 h-6 text-primary-500" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-4 md:px-12 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="card card-hover overflow-hidden group animate-slide-up flex-shrink-0 w-[360px]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Slider */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageSlider images={room.image_urls} roomName={room.name} />
                    <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg z-20">
                      {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                      {room.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Features */}
                    {room.amenities && room.amenities.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {room.amenities.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => {
                        // Scroll para o formulário
                        const bookingForm = document.getElementById('booking-form')
                        if (bookingForm) {
                          bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          // Disparar evento para highlight
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('highlightBookingForm'))
                          }, 500)
                        }
                      }}
                      className="btn-primary w-full text-center block text-sm py-2.5"
                    >
                      Consultar disponibilidade
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            <div className="text-center mt-6 md:hidden">
              <p className="text-sm text-gray-500">← Deslize para ver mais →</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Rooms
