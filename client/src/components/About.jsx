import { useEffect, useState } from 'react'
import { siteInfoAPI } from '../services/api'
import { MapPinIcon, ClockIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const About = () => {
  const [siteInfo, setSiteInfo] = useState(null)

  useEffect(() => {
    loadSiteInfo()
  }, [])

  const loadSiteInfo = async () => {
    try {
      const { data } = await siteInfoAPI.get()
      setSiteInfo(data)
    } catch (error) {
      console.error('Error loading site info:', error)
    }
  }

  if (!siteInfo) return null

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Sobre a Pousada
          </h2>
          <div className="w-24 h-1 bg-gradient-warm mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-slide-up">
            <p className="text-lg text-gray-700 leading-relaxed">
              {siteInfo.about_text}
            </p>

            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-4">
                <MapPinIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Localização</h4>
                  <p className="text-gray-600">{siteInfo.contact_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ClockIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Horários</h4>
                  <p className="text-gray-600">
                    Check-in: {siteInfo.check_in_time} • Check-out: {siteInfo.check_out_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <PhoneIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Telefone</h4>
                  <a href={`tel:${siteInfo.contact_phone}`} className="text-primary-600 hover:text-primary-700">
                    {siteInfo.contact_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <EnvelopeIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <a href={`mailto:${siteInfo.contact_email}`} className="text-primary-600 hover:text-primary-700">
                    {siteInfo.contact_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Image/Features Grid */}
          <div className="grid grid-cols-2 gap-4 animate-scale-in">
            <div className="card card-hover p-6 text-center">
              <div className="text-4xl mb-2">🏖️</div>
              <h3 className="font-bold text-gray-900 mb-2">Beira-mar</h3>
              <p className="text-sm text-gray-600">Vista privilegiada do oceano</p>
            </div>

            <div className="card card-hover p-6 text-center">
              <div className="text-4xl mb-2">🍳</div>
              <h3 className="font-bold text-gray-900 mb-2">Café Colonial</h3>
              <p className="text-sm text-gray-600">Café da manhã completo</p>
            </div>

            <div className="card card-hover p-6 text-center">
              <div className="text-4xl mb-2">🏊</div>
              <h3 className="font-bold text-gray-900 mb-2">Piscina</h3>
              <p className="text-sm text-gray-600">Área de lazer completa</p>
            </div>

            <div className="card card-hover p-6 text-center">
              <div className="text-4xl mb-2">🌴</div>
              <h3 className="font-bold text-gray-900 mb-2">Jardim</h3>
              <p className="text-sm text-gray-600">Área verde e relaxante</p>
            </div>

            <div className="card card-hover p-6 text-center col-span-2">
              <div className="text-4xl mb-2">✨</div>
              <h3 className="font-bold text-gray-900 mb-2">Conforto & Qualidade</h3>
              <p className="text-sm text-gray-600">Quartos climatizados com TV e WiFi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
