import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleTourInteraction = (e) => {
      setIsTourActive(e.detail)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('tourInteraction', handleTourInteraction)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('tourInteraction', handleTourInteraction)
    }
  }, [])

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Acomodações', href: '#rooms' },
    { name: 'Pacotes', href: '#packages' },
    { name: 'Galeria', href: '#gallery' },
    { name: 'Contato', href: '#contact' },
  ]

  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`absolute top-0 transition-all duration-300 ${
        isTourActive
          ? 'z-0 opacity-0 pointer-events-none'
          : 'z-50'
      } ${
        isScrolled
          ? 'left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg py-4'
          : 'right-0 bg-transparent py-6'
      }`}
    >
      <div className={isScrolled ? 'container-custom' : 'px-4 md:px-8'}>
        <div className="flex items-center justify-end">
          {/* Logo - only visible when scrolled */}
          {isScrolled && (
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="font-display text-2xl md:text-3xl font-bold mr-auto"
            >
              <span className="text-gradient-warm">
                Praia Bela
              </span>
            </a>
          )}

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
                className={`font-medium transition-colors duration-200 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-primary-500'
                    : 'text-white hover:text-accent-300 drop-shadow'
                }`}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#booking-form"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#booking-form')
              }}
              className={`btn-primary ${!isScrolled && 'shadow-xl'}`}
            >
              Reservar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className={`w-8 h-8 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <Bars3Icon className={`w-8 h-8 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
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
              <a
                href="#booking-form"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('#booking-form')
                }}
                className="btn-primary text-center"
              >
                Reservar
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
