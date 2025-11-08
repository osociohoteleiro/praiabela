import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline'

const BookingForm = () => {
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [isSticky, setIsSticky] = useState(false)
  const formRef = useRef(null)
  const placeholderRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current && placeholderRef.current) {
        const formTop = placeholderRef.current.getBoundingClientRect().top
        const shouldStick = formTop <= 0

        if (shouldStick !== isSticky) {
          setIsSticky(shouldStick)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSticky])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!checkIn || !checkOut) {
      alert('Por favor, selecione as datas de check-in e check-out')
      return
    }

    if (checkOut <= checkIn) {
      alert('A data de check-out deve ser posterior à data de check-in')
      return
    }

    // Here you would typically send to booking system or WhatsApp
    const message = `Olá! Gostaria de fazer uma reserva:
Check-in: ${checkIn.toLocaleDateString('pt-BR')}
Check-out: ${checkOut.toLocaleDateString('pt-BR')}
Adultos: ${adults}
Crianças: ${children}`

    const whatsappUrl = `https://wa.me/5573986644644?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      {/* Placeholder to maintain layout when form becomes fixed */}
      <div ref={placeholderRef} className={`${isSticky ? 'h-24' : ''}`} />

      <div
        id="booking-form"
        ref={formRef}
        className={`shadow-2xl transition-all duration-500 ease-in-out ${
          isSticky
            ? 'fixed top-0 left-0 right-0 z-50 rounded-none shadow-2xl animate-slide-down bg-gradient-to-r from-primary-500/90 via-accent-500/90 to-secondary-500/90 backdrop-blur-md py-4'
            : 'relative z-20 -mt-20 rounded-2xl bg-white p-6 md:p-8 mx-4 md:mx-auto max-w-6xl'
        }`}
      >
        {/* Title - only show when not sticky */}
        {!isSticky && (
          <h2 className="font-display font-bold text-center text-gradient-warm text-2xl md:text-3xl mb-6 transition-all duration-300">
            Faça sua Reserva
          </h2>
        )}

        <form onSubmit={handleSubmit} className="transition-all duration-300">
          {/* Centered container */}
          <div className={`flex items-end justify-center gap-3 ${isSticky ? 'px-4' : ''}`}>
            {/* Check-in */}
            <div className="relative">
              <label className={`input-label flex items-center gap-2 transition-all duration-300 ${
                isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
              }`}>
                <CalendarIcon className={`${isSticky ? 'w-3 h-3' : 'w-5 h-5'} ${isSticky ? 'text-white' : 'text-primary-500'}`} />
                Check-in
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione"
                className={`input-field ${isSticky ? 'text-sm py-2 w-32' : 'w-40'}`}
                required
              />
            </div>

            {/* Check-out */}
            <div className="relative">
              <label className={`input-label flex items-center gap-2 transition-all duration-300 ${
                isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
              }`}>
                <CalendarIcon className={`${isSticky ? 'w-3 h-3' : 'w-5 h-5'} ${isSticky ? 'text-white' : 'text-primary-500'}`} />
                Check-out
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione"
                className={`input-field ${isSticky ? 'text-sm py-2 w-32' : 'w-40'}`}
                required
              />
            </div>

            {/* Adults */}
            <div className="relative">
              <label className={`input-label flex items-center gap-2 transition-all duration-300 ${
                isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
              }`}>
                <UserGroupIcon className={`${isSticky ? 'w-3 h-3' : 'w-5 h-5'} ${isSticky ? 'text-white' : 'text-primary-500'}`} />
                Adultos
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className={`input-field ${isSticky ? 'text-sm py-2 w-28' : 'w-32'}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Children */}
            <div className="relative">
              <label className={`input-label flex items-center gap-2 transition-all duration-300 ${
                isSticky ? 'text-xs text-white font-semibold' : 'text-gray-700'
              }`}>
                <UserIcon className={`${isSticky ? 'w-3 h-3' : 'w-5 h-5'} ${isSticky ? 'text-white' : 'text-primary-500'}`} />
                Crianças
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className={`input-field ${isSticky ? 'text-sm py-2 w-28' : 'w-32'}`}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
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

            {/* Best Price Badge - show when sticky */}
            {isSticky && (
              <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
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
        </form>

        {!isSticky && (
          <p className="text-center text-sm text-gray-500 mt-4 transition-opacity duration-300">
            Ou ligue para <a href="tel:+5573986644644" className="text-primary-500 font-semibold hover:underline">(73) 98664-4644</a>
          </p>
        )}
      </div>
    </>
  )
}

export default BookingForm
