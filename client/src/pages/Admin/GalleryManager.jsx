import { useEffect, useState, useRef } from 'react'
import { galleryAPI, mediaAPI } from '../../services/api'
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

const GalleryManager = () => {
  const [galleryImages, setGalleryImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, image: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Upload states
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  // Form state for adding new images (multi-upload)
  // Each item: { id, file, preview, caption }
  const [newImages, setNewImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const galleryRes = await galleryAPI.getAllAdmin()
      setGalleryImages(galleryRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024

  // Append a list of files into newImages (multi mode)
  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    const accepted = []
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`"${file.name}": formato inválido (use JPG, PNG ou WEBP).`)
        continue
      }
      if (file.size > maxSize) {
        alert(`"${file.name}": maior que 5MB.`)
        continue
      }
      accepted.push(file)
    }
    accepted.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            preview: e.target.result,
            caption: '',
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  // Edit modal: still single-file replacement
  const handleEditFileSelect = (file) => {
    if (!file) return
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setEditingImage({ ...editingImage, newFile: file, newPreview: e.target.result })
    }
    reader.readAsDataURL(file)
  }

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e, isEdit = false) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return
    if (isEdit) {
      handleEditFileSelect(e.dataTransfer.files[0])
    } else {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeNewImage = (id) => {
    setNewImages((prev) => prev.filter((img) => img.id !== id))
  }

  const updateNewImageCaption = (id, caption) => {
    setNewImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)))
  }

  const resetAddModal = () => {
    setShowAddModal(false)
    setNewImages([])
    setUploadProgress({ done: 0, total: 0 })
  }

  const handleAddImages = async () => {
    if (newImages.length === 0) {
      alert('Selecione ao menos uma imagem para fazer upload')
      return
    }

    setUploading(true)
    setUploadProgress({ done: 0, total: newImages.length })
    const failures = []

    try {
      // Upload all files in a single multipart request
      const formData = new FormData()
      newImages.forEach((img) => formData.append('files', img.file))

      const uploadRes = await mediaAPI.uploadImages(formData)
      const uploaded = uploadRes.data.files || []

      if (uploaded.length !== newImages.length) {
        console.warn('Upload count mismatch', { sent: newImages.length, got: uploaded.length })
      }

      // Create one gallery entry per uploaded file (sequential to keep ordering)
      const baseOrder = galleryImages.length
      for (let i = 0; i < uploaded.length; i++) {
        try {
          await galleryAPI.create({
            url: uploaded[i].url,
            caption: newImages[i]?.caption || '',
            display_order: baseOrder + i,
            is_active: 1,
          })
          setUploadProgress((p) => ({ ...p, done: p.done + 1 }))
        } catch (err) {
          console.error('Gallery create error:', err)
          failures.push(newImages[i]?.file?.name || `imagem ${i + 1}`)
        }
      }

      resetAddModal()
      loadData()
      if (failures.length > 0) {
        alert(`Algumas imagens não foram salvas na galeria:\n- ${failures.join('\n- ')}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Erro ao fazer upload: ${error.response?.data?.message || error.message || 'desconhecido'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateImage = async () => {
    if (!editingImage) return

    setUploading(true)
    try {
      let imageUrl = editingImage.url

      // If new file was selected, upload it first
      if (editingImage.newFile) {
        const formData = new FormData()
        formData.append('image', editingImage.newFile)

        const uploadRes = await mediaAPI.uploadImage(formData)
        imageUrl = uploadRes.data.url
      }

      await galleryAPI.update(editingImage.id, {
        url: imageUrl,
        caption: editingImage.caption,
        display_order: editingImage.display_order,
        is_active: editingImage.is_active
      })
      setShowEditModal(false)
      setEditingImage(null)
      loadData()
    } catch (error) {
      console.error('Update error:', error)
      alert('Erro ao atualizar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.image || deleteConfirmText !== 'REMOVER IMAGEM') return

    try {
      await galleryAPI.delete(deleteModal.image.id)
      setDeleteModal({ show: false, image: null })
      setDeleteConfirmText('')
      loadData()
    } catch (error) {
      alert('Erro ao remover imagem')
    }
  }

  const handleToggleActive = async (image) => {
    try {
      await galleryAPI.update(image.id, {
        ...image,
        is_active: image.is_active ? 0 : 1
      })
      loadData()
    } catch (error) {
      alert('Erro ao alterar visibilidade')
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    const newOrder = [...galleryImages]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp

    try {
      await galleryAPI.reorder(newOrder.map((img, i) => ({ id: img.id, display_order: i })))
      loadData()
    } catch (error) {
      alert('Erro ao reordenar')
    }
  }

  const handleMoveDown = async (index) => {
    if (index === galleryImages.length - 1) return
    const newOrder = [...galleryImages]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp

    try {
      await galleryAPI.reorder(newOrder.map((img, i) => ({ id: img.id, display_order: i })))
      loadData()
    } catch (error) {
      alert('Erro ao reordenar')
    }
  }

  const openEditModal = (image) => {
    setEditingImage({ ...image })
    setShowEditModal(true)
  }

  const openDeleteModal = (image) => {
    setDeleteModal({ show: true, image })
    setDeleteConfirmText('')
  }

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Galeria de Fotos
            </h1>
            <p className="text-gray-600">Gerencie as imagens exibidas na galeria do site</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Imagem
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="admin-card text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma imagem na galeria</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Adicionar primeira imagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className={`admin-card group relative ${!image.is_active ? 'opacity-50' : ''}`}
              >
                {/* Image Preview */}
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={image.url}
                    alt={image.caption || 'Galeria'}
                    className="w-full h-full object-cover"
                  />
                  {!image.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">OCULTA</span>
                    </div>
                  )}
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Caption */}
                <p className="text-sm text-gray-700 mb-4 truncate">
                  {image.caption || <span className="text-gray-400 italic">Sem legenda</span>}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === galleryImages.length - 1}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(image)}
                    className={`p-2 rounded-lg ${
                      image.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={image.is_active ? 'Ocultar' : 'Mostrar'}
                  >
                    {image.is_active ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(image)}
                    className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(image)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    title="Remover"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Add Images Modal (multi-upload) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Adicionar Imagens à Galeria
                {newImages.length > 0 && (
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    ({newImages.length} {newImages.length === 1 ? 'selecionada' : 'selecionadas'})
                  </span>
                )}
              </h2>
              <button
                onClick={resetAddModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={uploading}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content (scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Arraste imagens ou clique para selecionar
                </p>
                <p className="text-gray-400 text-sm">
                  JPG, PNG, WEBP — até 5MB cada. Você pode selecionar várias de uma vez.
                </p>
              </div>

              {/* Selected images grid */}
              {newImages.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {newImages.map((img) => (
                    <div key={img.id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <div className="relative">
                        <img
                          src={img.preview}
                          alt={img.file.name}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => removeNewImage(img.id)}
                          disabled={uploading}
                          aria-label="Remover desta seleção"
                          className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500 truncate mb-1" title={img.file.name}>
                          {img.file.name} · {(img.file.size / 1024).toFixed(0)} KB
                        </p>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => updateNewImageCaption(img.id, e.target.value)}
                          placeholder="Legenda (opcional)"
                          disabled={uploading}
                          className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-primary-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {uploading && uploadProgress.total > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Salvando na galeria...</span>
                    <span>{uploadProgress.done} / {uploadProgress.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={resetAddModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddImages}
                disabled={newImages.length === 0 || uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  `Adicionar ${newImages.length || ''} ${newImages.length === 1 ? 'imagem' : 'imagens'}`.trim()
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Editar Imagem</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Upload Area for replacement */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all mb-6 ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, true)}
              >
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleEditFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <img
                    src={editingImage.newPreview || editingImage.url}
                    alt={editingImage.caption || 'Preview'}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 text-left">
                    {editingImage.newFile ? (
                      <p className="text-green-600 font-medium text-sm mb-1">
                        Nova imagem selecionada
                      </p>
                    ) : (
                      <p className="text-gray-600 font-medium text-sm mb-1">
                        Imagem atual
                      </p>
                    )}
                    <button
                      onClick={() => editFileInputRef.current?.click()}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      {editingImage.newFile ? 'Trocar imagem' : 'Substituir imagem'}
                    </button>
                    <p className="text-gray-400 text-xs mt-1">
                      ou arraste uma nova imagem aqui
                    </p>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legenda
                </label>
                <input
                  type="text"
                  value={editingImage.caption || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, caption: e.target.value })}
                  placeholder="Descrição da imagem"
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateImage}
                disabled={uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Remoção</h2>

            {deleteModal.image && (
              <img
                src={deleteModal.image.url}
                alt="Imagem a ser removida"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-gray-600 mb-4">
              Esta ação não pode ser desfeita. Digite <strong>REMOVER IMAGEM</strong> para confirmar.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="REMOVER IMAGEM"
              className="input-field w-full mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ show: false, image: null })
                  setDeleteConfirmText('')
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'REMOVER IMAGEM'}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryManager
