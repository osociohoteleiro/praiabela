import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import AdminLayout from '../../components/AdminLayout'
import { mediaAPI } from '../../services/api'
import { TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

const MediaManager = () => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all') // all, image, video

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const { data } = await mediaAPI.getAll()
      setMedia(data)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDropImages = async (acceptedFiles) => {
    setUploading(true)

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', 'general')

      try {
        await mediaAPI.uploadImage(formData)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    setUploading(false)
    loadMedia()
  }

  const onDropVideos = async (acceptedFiles) => {
    setUploading(true)

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('category', 'hero')

      try {
        await mediaAPI.uploadVideo(formData)
      } catch (error) {
        console.error('Error uploading video:', error)
      }
    }

    setUploading(false)
    loadMedia()
  }

  const imageDropzone = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const videoDropzone = useDropzone({
    onDrop: onDropVideos,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleDelete = async (key) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return

    try {
      await mediaAPI.delete(key)
      loadMedia()
    } catch (error) {
      alert('Erro ao deletar arquivo')
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    alert('URL copiada para a área de transferência!')
  }

  const filteredMedia = filter === 'all'
    ? media
    : media.filter(item => item.type === filter)

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Gerenciador de Mídia
          </h1>
          <p className="text-gray-600">Faça upload e gerencie fotos e vídeos</p>
        </div>

        {/* Upload Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Image Upload */}
          <div className="admin-card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload de Imagens</h2>
            <div
              {...imageDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                imageDropzone.isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...imageDropzone.getInputProps()} />
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {imageDropzone.isDragActive
                  ? 'Solte as imagens aqui...'
                  : 'Arraste imagens ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500">JPG, PNG, WEBP (máx. 5MB)</p>
            </div>
          </div>

          {/* Video Upload */}
          <div className="admin-card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload de Vídeos</h2>
            <div
              {...videoDropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                videoDropzone.isDragActive
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-300 hover:border-ocean-400'
              }`}
            >
              <input {...videoDropzone.getInputProps()} />
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {videoDropzone.isDragActive
                  ? 'Solte o vídeo aqui...'
                  : 'Arraste vídeo ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500">MP4, WebM, MOV (máx. 100MB)</p>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="admin-card mb-6 text-center">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-gray-600">Fazendo upload...</p>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({media.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'image'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Imagens ({media.filter(m => m.type === 'image').length})
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'video'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vídeos ({media.filter(m => m.type === 'video').length})
          </button>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="admin-card text-center py-12">
            <p className="text-gray-500">Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="admin-card group">
                {/* Preview */}
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>

                {/* Info */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                    {item.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(item.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-1 text-sm"
                    title="Copiar URL"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.s3_key)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    title="Deletar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// Icons (since we're using them locally)
const PhotoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const VideoCameraIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

export default MediaManager
