import { useEffect, useState, useRef } from 'react'
import { experiencesAPI, mediaAPI } from '../../services/api'
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

const ExperiencesManager = () => {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExperience, setEditingExperience] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, experience: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Upload states
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  // Form state for adding new experience
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    imageFile: null,
    imagePreview: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await experiencesAPI.getAllAdmin()
      setExperiences(res.data)
    } catch (error) {
      console.error('Error loading experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (file, isEdit = false) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (isEdit) {
        setEditingExperience({ ...editingExperience, newFile: file, newPreview: e.target.result })
      } else {
        setNewForm({ ...newForm, imageFile: file, imagePreview: e.target.result })
      }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], isEdit)
    }
  }

  const handleAddExperience = async () => {
    if (!newForm.title || !newForm.description) {
      alert('Preencha o título e a descrição')
      return
    }

    if (!newForm.imageFile && !newForm.imagePreview) {
      alert('Selecione uma imagem')
      return
    }

    setUploading(true)
    try {
      let imageUrl = newForm.imagePreview

      // Upload image to S3 if a file was selected
      if (newForm.imageFile) {
        const formData = new FormData()
        formData.append('image', newForm.imageFile)
        const uploadRes = await mediaAPI.uploadImage(formData)
        imageUrl = uploadRes.data.url
      }

      // Add experience
      await experiencesAPI.create({
        title: newForm.title,
        description: newForm.description,
        image_url: imageUrl,
        display_order: experiences.length,
        is_active: 1
      })

      setShowAddModal(false)
      setNewForm({ title: '', description: '', imageFile: null, imagePreview: '' })
      loadData()
    } catch (error) {
      console.error('Error adding experience:', error)
      alert('Erro ao adicionar experiência')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateExperience = async () => {
    if (!editingExperience) return

    if (!editingExperience.title || !editingExperience.description) {
      alert('Preencha o título e a descrição')
      return
    }

    setUploading(true)
    try {
      let imageUrl = editingExperience.image_url

      // If new file was selected, upload it first
      if (editingExperience.newFile) {
        const formData = new FormData()
        formData.append('image', editingExperience.newFile)
        const uploadRes = await mediaAPI.uploadImage(formData)
        imageUrl = uploadRes.data.url
      }

      await experiencesAPI.update(editingExperience.id, {
        title: editingExperience.title,
        description: editingExperience.description,
        image_url: imageUrl,
        display_order: editingExperience.display_order,
        is_active: editingExperience.is_active
      })

      setShowEditModal(false)
      setEditingExperience(null)
      loadData()
    } catch (error) {
      console.error('Update error:', error)
      alert('Erro ao atualizar experiência')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.experience || deleteConfirmText !== 'REMOVER') return

    try {
      await experiencesAPI.delete(deleteModal.experience.id)
      setDeleteModal({ show: false, experience: null })
      setDeleteConfirmText('')
      loadData()
    } catch (error) {
      alert('Erro ao remover experiência')
    }
  }

  const handleToggleActive = async (experience) => {
    try {
      await experiencesAPI.update(experience.id, {
        ...experience,
        is_active: experience.is_active ? 0 : 1
      })
      loadData()
    } catch (error) {
      alert('Erro ao alterar visibilidade')
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    const newOrder = [...experiences]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp

    try {
      await experiencesAPI.reorder(newOrder.map((exp, i) => ({ id: exp.id, display_order: i })))
      loadData()
    } catch (error) {
      alert('Erro ao reordenar')
    }
  }

  const handleMoveDown = async (index) => {
    if (index === experiences.length - 1) return
    const newOrder = [...experiences]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp

    try {
      await experiencesAPI.reorder(newOrder.map((exp, i) => ({ id: exp.id, display_order: i })))
      loadData()
    } catch (error) {
      alert('Erro ao reordenar')
    }
  }

  const openEditModal = (experience) => {
    setEditingExperience({ ...experience })
    setShowEditModal(true)
  }

  const openDeleteModal = (experience) => {
    setDeleteModal({ show: true, experience })
    setDeleteConfirmText('')
  }

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Experiências
            </h1>
            <p className="text-gray-600">Gerencie as experiências exibidas na seção "Somos Apaixonados"</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Experiência
          </button>
        </div>

        {/* Experiences Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="admin-card text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma experiência cadastrada</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Adicionar primeira experiência
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience, index) => (
              <div
                key={experience.id}
                className={`admin-card group relative ${!experience.is_active ? 'opacity-50' : ''}`}
              >
                {/* Image Preview */}
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={experience.image_url}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                  {!experience.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">OCULTA</span>
                    </div>
                  )}
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2">{experience.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {experience.description}
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
                    disabled={index === experiences.length - 1}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(experience)}
                    className={`p-2 rounded-lg ${
                      experience.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={experience.is_active ? 'Ocultar' : 'Mostrar'}
                  >
                    {experience.is_active ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(experience)}
                    className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(experience)}
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

      {/* Add Experience Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Adicionar Experiência</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewForm({ title: '', description: '', imageFile: null, imagePreview: '' })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="Ex: Boas-vindas!"
                  className="input-field w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="Descreva a experiência..."
                  rows={4}
                  className="input-field w-full resize-none"
                />
              </div>

              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : newForm.imagePreview
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, false)}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files[0], false)}
                    className="hidden"
                  />

                  {newForm.imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={newForm.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Trocar imagem
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium mb-1">
                        Arraste uma imagem ou clique para selecionar
                      </p>
                      <p className="text-gray-400 text-sm">
                        JPG, PNG, WEBP (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewForm({ title: '', description: '', imageFile: null, imagePreview: '' })
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddExperience}
                disabled={!newForm.title || !newForm.description || (!newForm.imageFile && !newForm.imagePreview) || uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Experience Modal */}
      {showEditModal && editingExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Editar Experiência</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={editingExperience.title}
                  onChange={(e) => setEditingExperience({ ...editingExperience, title: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={editingExperience.description}
                  onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                  rows={4}
                  className="input-field w-full resize-none"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
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
                    onChange={(e) => handleFileSelect(e.target.files[0], true)}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4">
                    <img
                      src={editingExperience.newPreview || editingExperience.image_url}
                      alt={editingExperience.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 text-left">
                      {editingExperience.newFile ? (
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
                        {editingExperience.newFile ? 'Trocar imagem' : 'Substituir imagem'}
                      </button>
                      <p className="text-gray-400 text-xs mt-1">
                        ou arraste uma nova imagem aqui
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateExperience}
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

            {deleteModal.experience && (
              <div className="mb-4">
                <img
                  src={deleteModal.experience.image_url}
                  alt={deleteModal.experience.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="font-medium text-gray-900">{deleteModal.experience.title}</p>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Esta ação não pode ser desfeita. Digite <strong>REMOVER</strong> para confirmar.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="REMOVER"
              className="input-field w-full mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ show: false, experience: null })
                  setDeleteConfirmText('')
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'REMOVER'}
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

export default ExperiencesManager
