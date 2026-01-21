import { useEffect, useState } from 'react'
import { promotionsAPI, mediaAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const Promotions = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    valid_until: '',
    image_url: '',
    is_active: true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, promo: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      const { data } = await promotionsAPI.getAllAdmin()
      setPromotions(data)
    } catch (error) {
      console.error('Error loading promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'promotions')

    try {
      const { data } = await mediaAPI.uploadImage(formData)
      setFormData(prev => ({ ...prev, image_url: data.url }))
    } catch (error) {
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const promotionData = {
      ...formData,
      is_active: formData.is_active ? 1 : 0,
    }

    try {
      if (editingPromotion) {
        await promotionsAPI.update(editingPromotion.id, promotionData)
      } else {
        await promotionsAPI.create(promotionData)
      }

      loadPromotions()
      closeModal()
    } catch (error) {
      alert('Erro ao salvar promoção')
    }
  }

  const openDeleteModal = (promo) => {
    setDeleteModal({ show: true, promo })
    setDeleteConfirmText('')
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, promo: null })
    setDeleteConfirmText('')
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== 'REMOVER PROMOÇÃO') return

    try {
      await promotionsAPI.delete(deleteModal.promo.id)
      loadPromotions()
      closeDeleteModal()
    } catch (error) {
      alert('Erro ao deletar promoção')
    }
  }

  const openModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount,
        valid_until: promotion.valid_until || '',
        image_url: promotion.image_url || '',
        is_active: promotion.is_active === 1,
      })
    } else {
      setEditingPromotion(null)
      setFormData({
        title: '',
        description: '',
        discount: '',
        valid_until: '',
        image_url: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPromotion(null)
  }

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Promoções
            </h1>
            <p className="text-gray-600">Gerencie as promoções do site</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Nova Promoção
          </button>
        </div>

        {/* Promotions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="admin-card text-center py-12">
            <p className="text-gray-500">Nenhuma promoção cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={`admin-card hover:shadow-xl transition-shadow ${
                  !promo.is_active ? 'opacity-60 border-2 border-dashed border-gray-300 bg-gray-50' : ''
                }`}
              >
                {promo.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className={`w-full h-48 object-cover rounded-lg mb-4 ${!promo.is_active ? 'grayscale' : ''}`}
                  />
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-xl font-bold ${promo.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{promo.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {promo.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{promo.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary-600">{promo.discount}% OFF</span>
                  {promo.valid_until && (
                    <p className="text-sm text-gray-500 mt-1">
                      Válido até: {new Date(promo.valid_until).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(promo)}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(promo)}
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Header Fixo */}
              <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
                </h2>
              </div>

              {/* Conteúdo Scrollável */}
              <div className="px-8 py-6 overflow-y-auto flex-1">
                <form id="promotion-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="input-label">Título</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="input-field"
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
                    />
                  </div>

                  <div>
                    <label className="input-label">Desconto (%)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      required
                      min="1"
                      max="100"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">Válido até (opcional)</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">Imagem</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {uploadingImage && <p className="text-sm text-gray-500 mt-2">Fazendo upload...</p>}
                    {formData.image_url && (
                      <div className="mt-3 relative inline-block">
                        <img src={formData.image_url} alt="Preview" className="h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                          title="Remover imagem"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      Promoção ativa
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.is_active}
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.is_active ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer Fixo */}
              <div className="px-8 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-4">
                  <button type="submit" form="promotion-form" className="btn-primary flex-1">
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
                  Remover Promoção
                </h2>
                <p className="text-gray-600">
                  Você está prestes a remover a promoção <strong>"{deleteModal.promo?.title}"</strong>. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="mb-6">
                <label className="input-label text-center block mb-2">
                  Digite <strong className="text-red-600">REMOVER PROMOÇÃO</strong> para confirmar
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input-field text-center"
                  placeholder="REMOVER PROMOÇÃO"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'REMOVER PROMOÇÃO'}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    deleteConfirmText === 'REMOVER PROMOÇÃO'
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

export default Promotions
