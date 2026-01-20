import { useState, useEffect } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { galleryAPI } from '../services/api'

const Gallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const { data } = await galleryAPI.getAll()
      setImages(data || [])
    } catch (error) {
      console.error('Error loading gallery:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom text-center">
          <div className="spinner mx-auto"></div>
        </div>
      </section>
    )
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
        {images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma imagem na galeria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-lg cursor-pointer group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openLightbox(image, index)}
              >
                <img
                  src={image.url}
                  alt={image.caption || 'Galeria'}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold p-4">{image.caption || ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
              alt={selectedImage.caption || 'Galeria'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4 text-lg">{selectedImage.caption}</p>
            )}
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
