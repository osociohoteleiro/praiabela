import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon, HomeIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleTourInteraction = (e) => {
      setIsTourActive(e.detail)
    }

    const handleOpenBookingModal = () => setIsBookingModalOpen(true)
    const handleCloseBookingModal = () => setIsBookingModalOpen(false)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('tourInteraction', handleTourInteraction)
    window.addEventListener('openBookingModal', handleOpenBookingModal)
    window.addEventListener('closeBookingModal', handleCloseBookingModal)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('tourInteraction', handleTourInteraction)
      window.removeEventListener('openBookingModal', handleOpenBookingModal)
      window.removeEventListener('closeBookingModal', handleCloseBookingModal)
    }
  }, [])

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Pacotes', href: '#packages' },
    { name: 'Promoções', href: '#promotions' },
    { name: 'Acomodações', href: '#rooms' },
    { name: 'Galeria', href: '#gallery' },
    { name: 'Contato', href: '#contact' },
  ]

  const closeBookingModal = () => {
    window.dispatchEvent(new CustomEvent('closeBookingModal'))
  }

  const scrollToSection = (href) => {
    closeBookingModal()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const openBookingModal = () => {
    window.dispatchEvent(new CustomEvent('openBookingModal'))
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Top Navbar - visible when not scrolled */}
      <nav
        className={`absolute top-0 right-0 transition-all duration-300 ${
          isTourActive || isBookingModalOpen
            ? 'z-0 opacity-0 pointer-events-none'
            : 'z-50'
        } ${
          isScrolled
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100 bg-transparent py-6'
        }`}
      >
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-end">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.href)
                  }}
                  className="font-medium transition-colors duration-200 text-white hover:text-accent-300 drop-shadow"
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={openBookingModal}
                className="btn-primary shadow-xl"
              >
                Reservar
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-8 h-8 text-white" />
              ) : (
                <Bars3Icon className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu - Top */}
          {isMobileMenuOpen && !isScrolled && (
            <div className="lg:hidden mt-4 pb-4 bg-white rounded-lg shadow-xl">
              <div className="flex flex-col space-y-4 p-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(link.href)
                    }}
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  onClick={openBookingModal}
                  className="btn-primary text-center w-full"
                >
                  Reservar
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Side Navbar - fixed on right when scrolled (Desktop only) */}
      <nav
        className={`fixed right-0 top-1/2 -translate-y-1/2 transition-all duration-500 hidden lg:block ${
          isTourActive
            ? 'z-0 opacity-0 pointer-events-none'
            : 'z-[110]'
        } ${
          isScrolled
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-l-2xl py-4 px-2">
          <div className="flex flex-col items-center space-y-1">
            {/* Home button */}
            <button
              onClick={() => {
                closeBookingModal()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="p-3 rounded-xl text-primary-500 hover:bg-primary-50 transition-colors group relative"
              title="Início"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Início
              </span>
            </button>

            <div className="w-8 h-px bg-gray-200 my-1"></div>

            {navLinks.slice(1).map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="p-3 rounded-xl text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-colors group relative"
                title={link.name}
              >
                <span className="text-xs font-semibold">{link.name.substring(0, 3)}</span>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {link.name}
                </span>
              </button>
            ))}

            <div className="w-8 h-px bg-gray-200 my-1"></div>

            {/* Reservar button */}
            <button
              onClick={openBookingModal}
              className="p-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors group relative"
              title="Reservar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-primary-500 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Reservar
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar - fixed when scrolled */}
      <nav
        className={`fixed bottom-0 left-0 right-0 lg:hidden transition-all duration-300 ${
          isTourActive || isBookingModalOpen
            ? 'z-0 opacity-0 pointer-events-none translate-y-full'
            : 'z-50'
        } ${
          isScrolled
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-2 py-2 safe-area-bottom">
          <div className="flex items-center justify-around">
            <button
              onClick={() => {
                closeBookingModal()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Início</span>
            </button>

            <button
              onClick={() => scrollToSection('#packages')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] mt-0.5">Pacotes</span>
            </button>

            <button
              onClick={openBookingModal}
              className="flex flex-col items-center p-3 -mt-4 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={() => scrollToSection('#rooms')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] mt-0.5">Quartos</span>
            </button>

            <button
              onClick={() => scrollToSection('#contact')}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] mt-0.5">Contato</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
