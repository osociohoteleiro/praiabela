import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
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

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      const { data } = await promotionsAPI.getAll()
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

    try {
      if (editingPromotion) {
        await promotionsAPI.update(editingPromotion.id, formData)
      } else {
        await promotionsAPI.create(formData)
      }

      loadPromotions()
      closeModal()
    } catch (error) {
      alert('Erro ao salvar promoção')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return

    try {
      await promotionsAPI.delete(id)
      loadPromotions()
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
    <AdminLayout>
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
              <div key={promo.id} className="admin-card hover:shadow-xl transition-shadow">
                {promo.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{promo.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                    onClick={() => handleDelete(promo.id)}
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
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
                    Promoção ativa
                  </label>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary flex-1">
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Promotions
