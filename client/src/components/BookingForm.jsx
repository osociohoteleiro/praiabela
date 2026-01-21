import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarIcon, UserGroupIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline'

const BookingForm = () => {
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [isSticky, setIsSticky] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [error, setError] = useState(null)
  const [mobileStep, setMobileStep] = useState(1) // 1: datas, 2: hóspedes
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingUrl, setBookingUrl] = useState('')
  const [isLoadingBooking, setIsLoadingBooking] = useState(false)
  const formRef = useRef(null)
  const placeholderRef = useRef(null)
  const checkInRef = useRef(null)
  const checkOutRef = useRef(null)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (placeholderRef.current) {
            const formTop = placeholderRef.current.getBoundingClientRect().top
            const shouldStick = formTop <= -10
            const shouldUnstick = formTop > 10

            setIsSticky(prev => {
              if (shouldStick && !prev) return true
              if (shouldUnstick && prev) return false
              return prev
            })
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleHighlight = () => {
      setIsHighlighted(true)
      setTimeout(() => setIsHighlighted(false), 2000)
    }

    window.addEventListener('highlightBookingForm', handleHighlight)
    return () => window.removeEventListener('highlightBookingForm', handleHighlight)
  }, [])

  // Listener para abrir modal direto (sem parâmetros)
  useEffect(() => {
    const handleOpenBookingModal = () => {
      const baseUrl = 'https://book.omnibees.com/hotelresults?q=4071&NRooms=1&lang=pt&currencyId=BRL'
      setBookingUrl(baseUrl)
      setIsLoadingBooking(true)
      setShowBookingModal(true)
      document.body.style.overflow = 'hidden'
    }

    const handleCloseBookingModal = () => {
      setShowBookingModal(false)
      setBookingUrl('')
      setIsLoadingBooking(false)
      document.body.style.overflow = ''
    }

    window.addEventListener('openBookingModal', handleOpenBookingModal)
    window.addEventListener('closeBookingModal', handleCloseBookingModal)
    return () => {
      window.removeEventListener('openBookingModal', handleOpenBookingModal)
      window.removeEventListener('closeBookingModal', handleCloseBookingModal)
    }
  }, [])

  const formatDateForOmnibees = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}${month}${year}`
  }

  const formatDateShort = (date) => {
    if (!date) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  // Auto-advance to step 2 when both dates are selected
  useEffect(() => {
    if (checkIn && checkOut && checkOut > checkIn) {
      setMobileStep(2)
    }
  }, [checkIn, checkOut])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!checkIn) {
      setError('Selecione a data de check-in')
      checkInRef.current?.setFocus()
      return
    }

    if (!checkOut) {
      setError('Selecione a data de check-out')
      checkOutRef.current?.setFocus()
      return
    }

    if (checkOut <= checkIn) {
      setError('Check-out deve ser após check-in')
      checkOutRef.current?.setFocus()
      return
    }

    const checkInFormatted = formatDateForOmnibees(checkIn)
    const checkOutFormatted = formatDateForOmnibees(checkOut)

    const omnibeesUrl = `https://book.omnibees.com/hotelresults?q=4071&NRooms=1&CheckIn=${checkInFormatted}&CheckOut=${checkOutFormatted}&ad=${adults}&ch=${children}&ag=&group_code=&Code=&loyalty_code=&lang=pt&currencyId=BRL`

    // Abrir modal com iframe ao invés de nova aba
    setBookingUrl(omnibeesUrl)
    setIsLoadingBooking(true)
    setShowBookingModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeBookingModal = () => {
    setShowBookingModal(false)
    setBookingUrl('')
    setIsLoadingBooking(false)
    document.body.style.overflow = ''
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Mobile Sticky Version
  const renderMobileSticky = () => (
    <div className="px-3 py-2">
      {mobileStep === 1 ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-white/80 font-medium block mb-0.5">Check-in</label>
              <DatePicker
                ref={checkInRef}
                selected={checkIn}
                onChange={(date) => {
                  setCheckIn(date)
                  setError(null)
                  setTimeout(() => checkOutRef.current?.setFocus(), 100)
                }}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                dateFormat="dd/MM"
                placeholderText="Selecione"
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-white/80 font-medium block mb-0.5">Check-out</label>
              <DatePicker
                ref={checkOutRef}
                selected={checkOut}
                onChange={(date) => {
                  setCheckOut(date)
                  setError(null)
                }}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                dateFormat="dd/MM"
                placeholderText="Selecione"
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileStep(1)}
            className="text-white/80 text-xs px-2 py-1 border border-white/30 rounded"
          >
            {formatDateShort(checkIn)} - {formatDateShort(checkOut)}
          </button>
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-white/80 font-medium block mb-0.5">Adultos</label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="input-field text-sm py-1.5 w-full"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-white/80 font-medium block mb-0.5">Crianças</label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="input-field text-sm py-1.5 w-full"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-white text-primary-600 font-bold px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
          >
            Reservar
          </button>
        </div>
      )}
      {error && (
        <div className="text-center mt-1">
          <span className="text-white text-xs bg-red-500/80 px-2 py-0.5 rounded-full">{error}</span>
        </div>
      )}
    </div>
  )

  // Mobile Non-Sticky Version
  const renderMobileForm = () => (
    <div className="space-y-4">
      {mobileStep === 1 ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-4 h-4 text-primary-500" />
              Check-in
            </label>
            <DatePicker
              ref={checkInRef}
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date)
                setError(null)
                setTimeout(() => checkOutRef.current?.setFocus(), 100)
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="input-label flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-4 h-4 text-primary-500" />
              Check-out
            </label>
            <DatePicker
              ref={checkOutRef}
              selected={checkOut}
              onChange={(date) => {
                setCheckOut(date)
                setError(null)
              }}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione"
              className="input-field w-full"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-2 mb-2">
            <div className="flex items-center gap-2 text-primary-700">
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">{formatDateShort(checkIn)} - {formatDateShort(checkOut)}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileStep(1)}
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Alterar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label flex items-center gap-2 text-gray-700">
                <UserGroupIcon className="w-4 h-4 text-primary-500" />
                Adultos
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="input-field w-full"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label flex items-center gap-2 text-gray-700">
                <UserIcon className="w-4 h-4 text-primary-500" />
                Crianças
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="input-field w-full"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
          >
            Verificar Disponibilidade
          </button>
        </>
      )}
      {error && (
        <div className="text-center">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  )

  // Desktop Version (inline)
  const renderDesktopForm = () => (
    <div className={`flex items-end justify-center gap-3 ${isSticky ? 'px-4' : ''}`}>
      <div className="relative">
        <label className={`input-label flex items-center gap-2 ${
          isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
        }`}>
          <CalendarIcon className={`${isSticky ? 'w-3 h-3 text-white' : 'w-5 h-5 text-primary-500'}`} />
          Check-in
        </label>
        <DatePicker
          ref={checkInRef}
          selected={checkIn}
          onChange={(date) => {
            setCheckIn(date)
            setError(null)
            setTimeout(() => checkOutRef.current?.setFocus(), 100)
          }}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione"
          className={`input-field ${isSticky ? 'text-sm py-2 w-32' : 'w-40'}`}
        />
      </div>

      <div className="relative">
        <label className={`input-label flex items-center gap-2 ${
          isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
        }`}>
          <CalendarIcon className={`${isSticky ? 'w-3 h-3 text-white' : 'w-5 h-5 text-primary-500'}`} />
          Check-out
        </label>
        <DatePicker
          ref={checkOutRef}
          selected={checkOut}
          onChange={(date) => {
            setCheckOut(date)
            setError(null)
          }}
          selectsEnd
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn || new Date()}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione"
          className={`input-field ${isSticky ? 'text-sm py-2 w-32' : 'w-40'}`}
        />
      </div>

      <div className="relative">
        <label className={`input-label flex items-center gap-2 ${
          isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
        }`}>
          <UserGroupIcon className={`${isSticky ? 'w-3 h-3 text-white' : 'w-5 h-5 text-primary-500'}`} />
          Adultos
        </label>
        <select
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          className={`input-field ${isSticky ? 'text-sm py-2 w-28' : 'w-32'}`}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className={`input-label flex items-center gap-2 ${
          isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
        }`}>
          <UserIcon className={`${isSticky ? 'w-3 h-3 text-white' : 'w-5 h-5 text-primary-500'}`} />
          Crianças
        </label>
        <select
          value={children}
          onChange={(e) => setChildren(Number(e.target.value))}
          className={`input-field ${isSticky ? 'text-sm py-2 w-28' : 'w-32'}`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <button
          type="submit"
          className={`transition-all duration-300 transform hover:scale-105 ${
            isSticky
              ? 'bg-white text-primary-600 hover:bg-gray-100 font-bold px-6 py-2.5 rounded-lg shadow-lg text-sm whitespace-nowrap'
              : 'btn-primary text-lg px-10 py-3 whitespace-nowrap'
          }`}
        >
          {isSticky ? 'Reservar' : 'Verificar Disponibilidade'}
        </button>
        {error && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
            {error}
          </div>
        )}
      </div>

      {isSticky && (
        <div className="hidden xl:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
          <svg className="w-6 h-6 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="text-xs">
            <div className="font-bold text-primary-600">Melhor Preço</div>
            <div className="text-gray-600">Garantido</div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div
        ref={placeholderRef}
        style={{ height: isSticky ? '180px' : '0px' }}
        className="transition-none"
      />

      <div
        id="booking-form"
        ref={formRef}
        className={`shadow-2xl ${
          isSticky
            ? 'fixed top-0 left-0 right-0 z-50 rounded-none shadow-2xl bg-gradient-to-r from-primary-500/90 via-accent-500/90 to-secondary-500/90 backdrop-blur-md py-2 md:py-4'
            : 'relative z-20 -mt-20 rounded-2xl bg-white p-6 md:p-8 mx-4 md:mx-auto max-w-6xl'
        } ${isHighlighted ? 'animate-pulse-highlight ring-4 ring-primary-500 ring-offset-2' : ''}`}
      >
        {/* Title - only show when not sticky */}
        {!isSticky && (
          <h2 className="font-display font-bold text-center text-gradient-warm text-2xl md:text-3xl mb-6">
            Faça sua Reserva
          </h2>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Mobile version */}
          <div className="md:hidden">
            {isSticky ? renderMobileSticky() : renderMobileForm()}
          </div>

          {/* Desktop version */}
          <div className="hidden md:block">
            {renderDesktopForm()}
          </div>
        </form>

        {!isSticky && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Ou ligue para <a href="tel:+5573986644644" className="text-primary-500 font-semibold hover:underline">(73) 98664-4644</a>
          </p>
        )}
      </div>

      {/* Modal de Reservas - Tela Cheia */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 animate-fade-in">
          {/* Header do Modal */}
          <div className="absolute top-0 left-0 right-0 bg-white shadow-lg z-10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-bold text-gradient-warm">
                Pousada Praia Bela
              </span>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="hidden sm:inline text-gray-600 text-sm">Motor de Reservas</span>
            </div>
            <button
              onClick={closeBookingModal}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Fechar</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoadingBooking && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-[5] mt-14">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando motor de reservas...</p>
              </div>
            </div>
          )}

          {/* Iframe do Motor de Reservas */}
          <iframe
            src={bookingUrl}
            className="w-full h-full pt-14 border-0 bg-white"
            title="Motor de Reservas - Pousada Praia Bela"
            onLoad={() => setIsLoadingBooking(false)}
            allow="payment"
          />
        </div>
      )}
    </>
  )
}

export default BookingForm
