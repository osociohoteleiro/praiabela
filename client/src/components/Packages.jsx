import { useEffect, useState, useRef } from 'react'
import { packagesAPI } from '../services/api'
import { StarIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      const { data } = await packagesAPI.getAll()
      setPackages(data)
    } catch (error) {
      console.error('Error loading packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 340 + 24 // card width + gap
      const scrollAmount = cardWidth * 2 // scroll 2 cards at a time
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom text-center">
          <div className="spinner mx-auto"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="packages" className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Pacotes Especiais
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aproveite nossas ofertas exclusivas e viva experiências inesquecíveis
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hidden md:block"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-6 h-6 text-primary-500" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hidden md:block"
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
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`card card-hover overflow-hidden relative animate-slide-up flex-shrink-0 w-[340px] ${
                  pkg.is_featured ? 'ring-4 ring-accent-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Featured Badge */}
                {pkg.is_featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-accent-400 text-white px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
                      <StarIcon className="w-5 h-5" />
                      <span className="font-bold text-sm">Destaque</span>
                    </div>
                  </div>
                )}

                {/* Image */}
                {pkg.image_urls && pkg.image_urls.length > 0 && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pkg.image_urls[0]}
                      alt={pkg.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">A partir de</p>
                    <p className="text-3xl font-bold text-gradient-warm">
                      R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-1.5 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">O que está incluído:</h4>
                    {pkg.inclusions.slice(0, 5).map((inclusion, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 leading-tight">{inclusion}</span>
                      </div>
                    ))}
                    {pkg.inclusions.length > 5 && (
                      <p className="text-xs text-gray-500 italic mt-2">+ {pkg.inclusions.length - 5} mais itens</p>
                    )}
                  </div>

                  {/* CTA */}
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
                    className={`${pkg.is_featured ? 'btn-accent' : 'btn-primary'} w-full text-center block text-sm py-2.5`}
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
      </div>
    </section>
  )
}

export default Packages
