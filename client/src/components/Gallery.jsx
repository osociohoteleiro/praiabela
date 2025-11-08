import { useState } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Sample gallery images (replace with actual images from S3)
const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
    caption: 'Vista da praia',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    caption: 'Pôr do sol',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    caption: 'Área da piscina',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    caption: 'Acomodações',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    caption: 'Café da manhã',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
    caption: 'Jardim tropical',
  },
]

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % galleryImages.length
    setCurrentIndex(newIndex)
    setSelectedImage(galleryImages[newIndex])
  }

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length
    setCurrentIndex(newIndex)
    setSelectedImage(galleryImages[newIndex])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-warm">
            Galeria de Fotos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça um pouco mais da nossa pousada através de nossas fotos
          </p>
          <div className="w-24 h-1 bg-gradient-warm mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-lg cursor-pointer group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openLightbox(image, index)}
            >
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4">{image.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-10 h-10" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeftIcon className="w-12 h-12" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4 text-lg">{selectedImage.caption}</p>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRightIcon className="w-12 h-12" />
          </button>
        </div>
      )}
    </section>
  )
}

export default Gallery
