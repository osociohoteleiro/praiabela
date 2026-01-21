import { useEffect, useState, useRef } from 'react'
import { promotionsAPI } from '../services/api'
import { TagIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/solid'

// Card de promoção reutilizável
const PromotionCard = ({ promo, index, onViewDetails }) => (
  <div
    className="card card-hover overflow-hidden relative animate-slide-up h-full flex flex-col"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Image */}
    {promo.image_url && (
      <div className="relative h-48 overflow-hidden">
        <img
          src={promo.image_url}
          alt={promo.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Discount Badge on Image */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-accent-500 text-white px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <TagIcon className="w-5 h-5" />
            <span className="font-bold text-sm">{promo.discount}% OFF</span>
          </div>
        </div>
      </div>
    )}

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      {/* Title with Badge (when no image) */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-xl font-display font-bold text-gray-900">
          {promo.title}
        </h3>
        {!promo.image_url && (
          <div className="bg-accent-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg flex-shrink-0">
            <TagIcon className="w-4 h-4" />
            <span className="font-bold text-xs">{promo.discount}% OFF</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
        {promo.description}
      </p>

      {/* Valid Until */}
      {promo.valid_until && (
        <p className="text-xs text-gray-500 mb-4">
          Válido até: {new Date(promo.valid_until).toLocaleDateString('pt-BR')}
        </p>
      )}

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => onViewDetails(promo)}
          className="btn-secondary w-full text-center block text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <EyeIcon className="w-4 h-4" />
          Ver detalhes
        </button>
        <button
          onClick={() => {
            const bookingForm = document.getElementById('booking-form')
            if (bookingForm) {
              bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('highlightBookingForm'))
              }, 500)
            }
          }}
          className="btn-accent w-full text-center block text-sm py-2.5"
        >
          Aproveitar promoção
        </button>
      </div>
    </div>
  </div>
)

// Modal de detalhes da promoção
const PromotionModal = ({ promo, onClose }) => {
  if (!promo) return null

  const scrollToBooking = () => {
    onClose()
    setTimeout(() => {
      const bookingForm = document.getElementById('booking-form')
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('highlightBookingForm'))
        }, 500)
      }
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex-shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
            aria-label="Fechar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>

          {/* Discount Badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-accent-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
              <TagIcon className="w-6 h-6" />
              <span className="font-bold text-lg">{promo.discount}% OFF</span>
            </div>
          </div>

          {/* Image */}
          {promo.image_url ? (
            <div className="h-64 md:h-80 overflow-hidden">
              <img
                src={promo.image_url}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-32 bg-gradient-warm"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            {promo.title}
          </h2>

          {/* Valid Until */}
          {promo.valid_until && (
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              <span>Válido até: <strong>{new Date(promo.valid_until).toLocaleDateString('pt-BR')}</strong></span>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {promo.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-8 p-6 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Aproveite esta oferta!</h3>
            <p className="text-gray-700">
              Não perca esta oportunidade única de economizar <strong className="text-accent-600">{promo.discount}%</strong> na sua estadia.
              Entre em contato conosco para mais informações e faça sua reserva.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToBooking}
              className="btn-accent flex-1 py-4 text-lg font-semibold"
            >
              Reservar com desconto
            </button>
            <button
              onClick={onClose}
              className="btn-secondary flex-1 py-4 text-lg font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Promotions = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showDesktopArrows, setShowDesktopArrows] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState(null)
  const scrollContainerRef = useRef(null)

  const minSwipeDistance = 50
  const cardWidth = 340
  const cardGap = 24

  useEffect(() => {
    loadPromotions()
  }, [])

  // Check if desktop arrows should be shown
  useEffect(() => {
    const checkArrowsVisibility = () => {
      if (scrollContainerRef.current && promotions.length > 0) {
        const containerWidth = scrollContainerRef.current.clientWidth - 96
        const totalCardsWidth = promotions.length * cardWidth + (promotions.length - 1) * cardGap
        setShowDesktopArrows(totalCardsWidth > containerWidth)
      }
    }

    checkArrowsVisibility()
    window.addEventListener('resize', checkArrowsVisibility)
    return () => window.removeEventListener('resize', checkArrowsVisibility)
  }, [promotions])

  // Block body scroll when modal is open
  useEffect(() => {
    if (selectedPromo) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedPromo])

  const loadPromotions = async () => {
    try {
      const { data } = await promotionsAPI.getAll()
      setPromotions(data)
    } catch (error) {
      console.error('Error loading promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = (cardWidth + cardGap) * 2
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // Mobile slider navigation
  const goToNextMobile = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % promotions.length)
  }

  const goToPrevMobile = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + promotions.length) % promotions.length)
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
    if (isLeftSwipe && promotions.length > 1) {
      goToNextMobile()
    }
    if (isRightSwipe && promotions.length > 1) {
      goToPrevMobile()
    }
  }

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom text-center">
          <div className="spinner mx-auto"></div>
        </div>
      </section>
    )
  }

  // Don't render section if no promotions
  if (promotions.length === 0) {
    return null
  }

  return (
    <>
      <section id="promotions" className="section-padding bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
              Promoções
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aproveite nossas ofertas especiais e economize na sua estadia
            </p>
            <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
          </div>

          <>
            {/* Mobile Slider - Um card por vez */}
            <div className="md:hidden">
              <div
                className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Navigation Buttons */}
                {promotions.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevMobile}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 shadow-lg rounded-full p-2 -ml-2"
                      aria-label="Anterior"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-primary-500" />
                    </button>

                    <button
                      onClick={goToNextMobile}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 shadow-lg rounded-full p-2 -mr-2"
                      aria-label="Próximo"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-primary-500" />
                    </button>
                  </>
                )}

                {/* Card Container */}
                <div className="px-6">
                  <PromotionCard
                    promo={promotions[currentMobileIndex]}
                    index={0}
                    onViewDetails={setSelectedPromo}
                  />
                </div>

                {/* Indicadores de posição */}
                {promotions.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {promotions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentMobileIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          idx === currentMobileIndex
                            ? 'bg-primary-500 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ir para promoção ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Slider - Múltiplos cards */}
            <div className="hidden md:block relative">
              {/* Navigation Buttons - Only show when needed */}
              {showDesktopArrows && (
                <>
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
                    aria-label="Anterior"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-primary-500" />
                  </button>

                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-[2] bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
                    aria-label="Próximo"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-primary-500" />
                  </button>
                </>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-12 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {promotions.map((promo, index) => (
                  <div key={promo.id} className="flex-shrink-0 w-[340px]">
                    <PromotionCard
                      promo={promo}
                      index={index}
                      onViewDetails={setSelectedPromo}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        </div>
      </section>

      {/* Modal de detalhes */}
      {selectedPromo && (
        <PromotionModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}
    </>
  )
}

export default Promotions
