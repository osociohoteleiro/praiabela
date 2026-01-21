import { useEffect, useState } from 'react'
import { roomsAPI, mediaAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 2,
    size: '',
    amenities: [''],
    image_urls: [],
    is_active: true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, room: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const { data } = await roomsAPI.getAllAdmin()
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    const formDataUpload = new FormData()
    formDataUpload.append('image', file)
    formDataUpload.append('category', 'rooms')

    try {
      const { data } = await mediaAPI.uploadImage(formDataUpload)
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, data.url]
      }))
    } catch (error) {
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const filteredAmenities = formData.amenities.filter(amenity => amenity.trim() !== '')

    const roomData = {
      ...formData,
      amenities: filteredAmenities,
      capacity: parseInt(formData.capacity),
    }

    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, roomData)
      } else {
        await roomsAPI.create(roomData)
      }

      loadRooms()
      closeModal()
    } catch (error) {
      alert('Erro ao salvar quarto')
    }
  }

  const openDeleteModal = (room) => {
    setDeleteModal({ show: true, room })
    setDeleteConfirmText('')
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, room: null })
    setDeleteConfirmText('')
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== 'REMOVER QUARTO') return

    try {
      await roomsAPI.delete(deleteModal.room.id)
      loadRooms()
      closeDeleteModal()
    } catch (error) {
      alert('Erro ao deletar quarto')
    }
  }

  const openModal = (room = null) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        size: room.size || '',
        amenities: room.amenities.length > 0 ? room.amenities : [''],
        image_urls: room.image_urls || [],
        is_active: room.is_active === 1,
      })
    } else {
      setEditingRoom(null)
      setFormData({
        name: '',
        description: '',
        capacity: 2,
        size: '',
        amenities: [''],
        image_urls: [],
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRoom(null)
  }

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }))
  }

  const updateAmenity = (index, value) => {
    const newAmenities = [...formData.amenities]
    newAmenities[index] = value
    setFormData(prev => ({ ...prev, amenities: newAmenities }))
  }

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Quartos
            </h1>
            <p className="text-gray-600">Gerencie os quartos e acomodações</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Novo Quarto
          </button>
        </div>

        {/* Rooms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="admin-card text-center py-12">
            <p className="text-gray-500">Nenhum quarto cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="admin-card hover:shadow-xl transition-shadow">
                {room.image_urls && room.image_urls.length > 0 ? (
                  <img
                    src={room.image_urls[0]}
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    room.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{room.capacity} pessoas</span>
                  </div>
                  {room.size && (
                    <div>
                      <span>{room.size}</span>
                    </div>
                  )}
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{room.amenities.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(room)}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(room)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
              {/* Header Fixo */}
              <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRoom ? 'Editar Quarto' : 'Novo Quarto'}
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Conteúdo Rolável */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <form id="room-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="input-label">Nome do Quarto</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Ex: Suíte Master Frente Mar"
                    />
                  </div>

                  <div>
                    <label className="input-label">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                      className="input-field"
                      placeholder="Descreva o quarto..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Capacidade (pessoas)</label>
                      <select
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="input-field"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="input-label">Tamanho</label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="input-field"
                        placeholder="Ex: 35m²"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Comodidades</label>
                    {formData.amenities.map((amenity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => updateAmenity(index, e.target.value)}
                          className="input-field"
                          placeholder="Ex: Ar condicionado, Wi-Fi, TV..."
                        />
                        {formData.amenities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Adicionar comodidade
                    </button>
                  </div>

                  <div>
                    <label className="input-label">Imagens</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {uploadingImage && <p className="text-sm text-gray-500 mt-2">Fazendo upload...</p>}

                    {formData.image_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {formData.image_urls.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      Quarto ativo (visível no site)
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer Fixo */}
              <div className="px-8 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-4">
                  <button type="submit" form="room-form" className="btn-primary flex-1">
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Remover Quarto
                </h2>
                <p className="text-gray-600">
                  Você está prestes a remover o quarto <strong>"{deleteModal.room?.name}"</strong>. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="mb-6">
                <label className="input-label text-center block mb-2">
                  Digite <strong className="text-red-600">REMOVER QUARTO</strong> para confirmar
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input-field text-center"
                  placeholder="REMOVER QUARTO"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'REMOVER QUARTO'}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    deleteConfirmText === 'REMOVER QUARTO'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirmar Remoção
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Rooms
