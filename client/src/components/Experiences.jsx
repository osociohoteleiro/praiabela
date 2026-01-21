import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { experiencesAPI } from '../services/api'

// Card de experiência
const ExperienceCard = ({ experience, index }) => (
  <div
    className="group animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/5]">
      <img
        src={experience.image_url}
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
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      const { data } = await experiencesAPI.getAll()
      setExperiences(data)
    } catch (error) {
      console.error('Error loading experiences:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom text-center">
          <div className="spinner mx-auto"></div>
        </div>
      </section>
    )
  }

  if (experiences.length === 0) {
    return null
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
