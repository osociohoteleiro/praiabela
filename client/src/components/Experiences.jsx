import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const experiences = [
  {
    id: 1,
    title: 'Boas-vindas!',
    description: 'Na chegada, você será recepcionado com um suco de cacau geladinho e um chocolate orgânico 60% cacau para começar bem a sua estadia.',
    image: 'https://praiabela.com.br/wp-content/uploads/2024/01/625e01b005b86510d8bcd756_Boas-vindas-p-500.webp'
  },
  {
    id: 2,
    title: 'Nossa despedida',
    description: 'No check-out você recebe um tsuru de despedida, que significa prosperidade e longevidade e alinha com a origem dos proprietários que são descendentes de japoneses. O tsuru é um origami de ave.',
    image: 'https://praiabela.com.br/wp-content/uploads/2024/01/625ec5b82e2ad383153df250_Despedida-p-500.webp'
  },
  {
    id: 3,
    title: 'Spa do Cacau',
    description: 'Oferecemos vários tipos de massagens, realizados por profissionais especializados! A novidade agora é o SPA do Cacau, que conta com os benefícios desse poderoso fruto!',
    image: 'https://praiabela.com.br/wp-content/uploads/2024/01/62913f35ead22d076a2a96c8_Spa-do-Cacau.webp'
  },
  {
    id: 4,
    title: 'Pingo no Oceano',
    description: 'Todo o recolhimento de óleo usado é transformado em sabão, que é colocado à disposição na pousada e ofertado quando você traz o seu lixo.',
    image: 'https://praiabela.com.br/wp-content/uploads/2024/01/62913f4518fd241310568d02_Pingo-no-Oceano-p-500.webp'
  },
  {
    id: 5,
    title: 'Vira Bolsa',
    description: 'Parceria com Associação ACEAI convertendo roupas de cama danificadas em bolsas educacionais para costureiras locais, promovendo sustentabilidade.',
    image: 'https://praiabela.com.br/wp-content/uploads/2024/01/62823dc02938fbe60cff66e8_Vira-Bolsa-p-500.webp'
  }
]

// Card de experiência
const ExperienceCard = ({ experience, index }) => (
  <div
    className="group animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/5]">
      <img
        src={experience.image}
        alt={experience.title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      {/* Overlay com descrição */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        <p className="text-white text-sm leading-relaxed">{experience.description}</p>
      </div>
    </div>
    <h3 className="text-center font-display text-xl italic text-gray-700 mt-4">
      {experience.title}
    </h3>
  </div>
)

const Experiences = () => {
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  // Mobile slider navigation
  const goToNextMobile = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % experiences.length)
  }

  const goToPrevMobile = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
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
    if (isLeftSwipe) {
      goToNextMobile()
    }
    if (isRightSwipe) {
      goToPrevMobile()
    }
  }

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Somos Apaixonados por Nossos Hóspedes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            por isso transformamos cada momento em uma linda experiência
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Mobile Slider */}
        <div className="md:hidden">
          <div
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Navigation Buttons */}
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

            {/* Card */}
            <div className="px-6">
              <ExperienceCard experience={experiences[currentMobileIndex]} index={0} />
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-4">
              {experiences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMobileIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    idx === currentMobileIndex
                      ? 'bg-primary-500 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir para experiência ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6">
          {experiences.map((experience, index) => (
            <ExperienceCard key={experience.id} experience={experience} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experiences
