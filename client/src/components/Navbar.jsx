import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-lg py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="font-display text-2xl md:text-3xl font-bold"
          >
            <span className={isScrolled ? 'text-gradient-warm' : 'text-white drop-shadow-lg'}>
              Praia Bela
            </span>
          </a>

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
