import { useEffect, useState } from 'react'
import { packagesAPI } from '../services/api'
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

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
    <section id="packages" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Pacotes Especiais
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aproveite nossas ofertas exclusivas e viva experiências inesquecíveis
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`card card-hover overflow-hidden relative animate-slide-up ${
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
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pkg.image_urls[0]}
                    alt={pkg.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                <p className="text-gray-600 mb-4">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">A partir de</p>
                  <p className="text-4xl font-bold text-gradient-warm">
                    R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Inclusions */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">O que está incluído:</h4>
                  {pkg.inclusions.map((inclusion, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{inclusion}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href="#booking-form"
                  className={pkg.is_featured ? 'btn-accent w-full text-center block' : 'btn-primary w-full text-center block'}
                >
                  Reservar Agora
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Packages
