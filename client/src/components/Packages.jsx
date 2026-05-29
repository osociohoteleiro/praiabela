import { useEffect, useState, useRef } from 'react'
import { packagesAPI } from '../services/api'
import { StarIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'

// "YYYY-MM-DD" -> "DDMMYYYY" (Omnibees format)
const toOmnibeesDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}${m}${y}`
}

// "YYYY-MM-DD" -> "DD/MM/YYYY" for display
const toDisplayDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const buildOmnibeesUrl = (pkg) => {
  const params = new URLSearchParams({
    q: '4071',
    NRooms: '1',
    ad: '2',
    ch: '0',
    lang: 'pt',
    currencyId: 'BRL',
  })
  if (pkg.start_date) params.set('CheckIn', toOmnibeesDate(pkg.start_date))
  if (pkg.end_date) params.set('CheckOut', toOmnibeesDate(pkg.end_date))
  return `https://book.omnibees.com/hotelresults?${params.toString()}`
}

const handlePackageCTA = (pkg) => {
  // If package has dates, jump straight to Omnibees with them pre-filled.
  if (pkg.start_date || pkg.end_date) {
    window.open(buildOmnibeesUrl(pkg), '_blank', 'noopener,noreferrer')
    return
  }
  // Otherwise, scroll to booking form so user picks dates.
  const bookingForm = document.getElementById('booking-form')
  if (bookingForm) {
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('highlightBookingForm'))
    }, 500)
  }
}

const formatPeriod = (pkg) => {
  if (pkg.start_date && pkg.end_date) {
    return `${toDisplayDate(pkg.start_date)} a ${toDisplayDate(pkg.end_date)}`
  }
  return `A partir de ${toDisplayDate(pkg.start_date || pkg.end_date)}`
}

// Card de pacote reutilizável
const PackageCard = ({ pkg, index, onViewDetails }) => {
  const onRequest = !pkg.price || pkg.price === 0
  return (
  <div
    className={`card card-hover overflow-hidden relative animate-slide-up h-full flex flex-col cursor-pointer ${
      pkg.is_featured === 1 ? 'ring-4 ring-accent-400' : ''
    }`}
    style={{ animationDelay: `${index * 0.1}s` }}
    onClick={() => onViewDetails(pkg)}
  >
    {/* Featured Badge */}
    {pkg.is_featured === 1 && (
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
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
        {pkg.name}
      </h3>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {pkg.description}
      </p>

      {/* Period */}
      {(pkg.start_date || pkg.end_date) && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
          <CalendarIcon className="w-4 h-4 text-primary-500" />
          <span>{formatPeriod(pkg)}</span>
        </div>
      )}

      {/* Price */}
      <div className="mb-4">
        {onRequest ? (
          <p className="text-2xl font-bold text-gradient-warm italic">Sob consulta</p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-1">A partir de</p>
            <p className="text-3xl font-bold text-gradient-warm">
              R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </>
        )}
      </div>

      {/* Inclusions (preview) */}
      <div className="space-y-1.5 mb-4 flex-1">
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

      {/* CTAs */}
      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onViewDetails(pkg)}
          className="btn-secondary w-full text-center block text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <EyeIcon className="w-4 h-4" />
          Ver detalhes
        </button>
        <button
          onClick={() => handlePackageCTA(pkg)}
          className={`${pkg.is_featured === 1 ? 'btn-accent' : 'btn-primary'} w-full text-center block text-sm py-2.5`}
        >
          {onRequest ? 'Consultar' : 'Consultar disponibilidade'}
        </button>
      </div>
    </div>
  </div>
  )
}

// Modal de detalhes do pacote (tela cheia, imagem lateral sem corte)
const PackageModal = ({ pkg, onClose }) => {
  const [imageIdx, setImageIdx] = useState(0)

  useEffect(() => {
    setImageIdx(0)
  }, [pkg?.id])

  if (!pkg) return null

  const onRequest = !pkg.price || pkg.price === 0
  const images = pkg.image_urls || []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  const nextImage = (e) => {
    e?.stopPropagation()
    setImageIdx((i) => (i + 1) % images.length)
  }
  const prevImage = (e) => {
    e?.stopPropagation()
    setImageIdx((i) => (i - 1 + images.length) % images.length)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top right of modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transition-colors"
          aria-label="Fechar"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Image column — full image visible (no crop), neutral light background fills any letterboxing */}
        {hasImages ? (
          <div className="relative md:w-1/2 h-[50vh] md:h-auto md:max-h-[90vh] flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img
              src={images[imageIdx]}
              alt={`${pkg.name} ${imageIdx + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
            {pkg.is_featured === 1 && (
              <div className="absolute top-4 left-4 bg-accent-400 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                <StarIcon className="w-4 h-4" />
                <span className="font-bold text-xs">Destaque</span>
              </div>
            )}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-800 shadow-md transition-colors z-10"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-800 shadow-md transition-colors z-10"
                  aria-label="Próxima imagem"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/90 px-3 py-1.5 rounded-full shadow-md z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImageIdx(i) }}
                      className={`h-1.5 rounded-full transition-all ${i === imageIdx ? 'bg-primary-500 w-5' : 'bg-gray-300 w-1.5'}`}
                      aria-label={`Ir para imagem ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="md:w-1/3 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-8">
            <StarIcon className="w-20 h-20 text-primary-300" />
          </div>
        )}

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="overflow-y-auto p-6 sm:p-8 flex-1">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3 pr-12">
              {pkg.name}
            </h2>

            {(pkg.start_date || pkg.end_date) && (
              <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-primary-50 px-3 py-1.5 rounded-full mb-4">
                <CalendarIcon className="w-4 h-4 text-primary-500" />
                <span>{formatPeriod(pkg)}</span>
              </div>
            )}

            <div className="mb-5 pb-5 border-b border-gray-100">
              {onRequest ? (
                <p className="text-2xl font-bold text-gradient-warm italic">Sob consulta</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-1">A partir de</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gradient-warm">
                    R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </>
              )}
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-gray-900 mb-2">Sobre este pacote</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{pkg.description}</p>
            </div>

            {pkg.inclusions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O que está incluído</h3>
                <ul className="space-y-1.5">
                  {pkg.inclusions.map((inc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-sm">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-gray-100 p-4 flex gap-3 flex-shrink-0 bg-white">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Fechar
            </button>
            <button
              onClick={() => { handlePackageCTA(pkg); onClose() }}
              className={`${pkg.is_featured === 1 ? 'btn-accent' : 'btn-primary'} flex-1 py-2.5`}
            >
              {onRequest ? 'Consultar' : 'Consultar disponibilidade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showDesktopArrows, setShowDesktopArrows] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const scrollContainerRef = useRef(null)

  // Block body scroll + ESC to close modal
  useEffect(() => {
    if (!selectedPackage) return
    const onKey = (e) => { if (e.key === 'Escape') setSelectedPackage(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [selectedPackage])

  const minSwipeDistance = 50
  const cardWidth = 340
  const cardGap = 24

  useEffect(() => {
    loadPackages()
  }, [])

  // Check if desktop arrows should be shown
  useEffect(() => {
    const checkArrowsVisibility = () => {
      if (scrollContainerRef.current && packages.length > 0) {
        const containerWidth = scrollContainerRef.current.clientWidth - 96 // subtract padding (px-12 = 48px each side)
        const totalCardsWidth = packages.length * cardWidth + (packages.length - 1) * cardGap
        setShowDesktopArrows(totalCardsWidth > containerWidth)
      }
    }

    checkArrowsVisibility()
    window.addEventListener('resize', checkArrowsVisibility)
    return () => window.removeEventListener('resize', checkArrowsVisibility)
  }, [packages])

  const loadPackages = async () => {
    try {
      const { data } = await packagesAPI.getAll()
      setPackages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 340 + 24
      const scrollAmount = cardWidth * 2
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // Mobile slider navigation
  const goToNextMobile = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % packages.length)
  }

  const goToPrevMobile = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + packages.length) % packages.length)
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
    if (isLeftSwipe && packages.length > 1) {
      goToNextMobile()
    }
    if (isRightSwipe && packages.length > 1) {
      goToPrevMobile()
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

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum pacote disponível no momento.</p>
          </div>
        ) : (
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
                {packages.length > 1 && (
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
                  <PackageCard pkg={packages[currentMobileIndex]} index={0} onViewDetails={setSelectedPackage} />
                </div>

                {/* Indicadores de posição */}
                {packages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {packages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentMobileIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          idx === currentMobileIndex
                            ? 'bg-primary-500 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ir para pacote ${idx + 1}`}
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
                {packages.map((pkg, index) => (
                  <div key={pkg.id} className="flex-shrink-0 w-[340px]">
                    <PackageCard pkg={pkg} index={index} onViewDetails={setSelectedPackage} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details modal */}
      {selectedPackage && (
        <PackageModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />
      )}
    </section>
  )
}

export default Packages
