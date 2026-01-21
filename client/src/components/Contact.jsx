import { useEffect, useState } from 'react'
import { siteInfoAPI } from '../services/api'
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const Contact = () => {
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
    <section id="contact" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas ou faça sua reserva. Estamos aqui para ajudar!
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Contact Info - Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
          <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-warm rounded-full flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Endereço</h4>
              <p className="text-gray-600 text-sm">{siteInfo.contact_address}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-warm rounded-full flex items-center justify-center flex-shrink-0">
              <PhoneIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Telefone</h4>
              <a href={`tel:${siteInfo.contact_phone}`} className="text-primary-600 hover:text-primary-700 text-sm">
                {siteInfo.contact_phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-warm rounded-full flex items-center justify-center flex-shrink-0">
              <EnvelopeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Email</h4>
              <a href={`mailto:${siteInfo.contact_email}`} className="text-primary-600 hover:text-primary-700 text-sm">
                {siteInfo.contact_email}
              </a>
            </div>
          </div>
        </div>

        {/* Map - Full Width */}
        <div className="rounded-2xl overflow-hidden shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.8!2d-39.0266058!3d-14.8397789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x739a2ff54a60e71%3A0x10c9af4b2db0b43f!2sPousada%20Praia%20Bela!5e0!3m2!1spt-BR!2sbr!4v1706000000000"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da Pousada Praia Bela"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default Contact
