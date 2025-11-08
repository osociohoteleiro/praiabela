const rooms = [
  {
    id: 1,
    name: 'Suíte Standard',
    description: 'Quarto confortável com vista para o jardim, ar-condicionado, TV e WiFi.',
    features: ['Ar-condicionado', 'TV a cabo', 'WiFi gratuito', 'Frigobar'],
    capacity: '2 pessoas',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  },
  {
    id: 2,
    name: 'Suíte Deluxe',
    description: 'Acomodação espaçosa com varanda e vista parcial do mar.',
    features: ['Vista para o mar', 'Varanda', 'Ar-condicionado', 'TV Smart', 'Minibar'],
    capacity: '3 pessoas',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  },
  {
    id: 3,
    name: 'Suíte Premium',
    description: 'Nossa melhor acomodação com vista panorâmica do mar e banheira de hidromassagem.',
    features: ['Vista panorâmica', 'Hidromassagem', 'Varanda ampla', 'King size', 'Minibar premium'],
    capacity: '4 pessoas',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  },
]

const Rooms = () => {
  return (
    <section id="rooms" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Nossas Acomodações
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o quarto perfeito para sua estadia. Todos com ar-condicionado, WiFi e café da manhã incluído.
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card card-hover overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${room.id * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600">
                  {room.capacity}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  {room.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {room.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {room.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a href="#booking-form" className="btn-primary w-full text-center block">
                  Reservar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Rooms
