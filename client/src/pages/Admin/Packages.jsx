import { useEffect, useState } from 'react'
import { packagesAPI, mediaAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inclusions: [''],
    image_urls: [],
    is_featured: false,
    is_active: true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, pkg: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      const { data } = await packagesAPI.getAllAdmin()
      setPackages(data)
    } catch (error) {
      console.error('Error loading packages:', error)
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
    formDataUpload.append('category', 'packages')

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

    const filteredInclusions = formData.inclusions.filter(inc => inc.trim() !== '')

    const packageData = {
      ...formData,
      inclusions: filteredInclusions,
      price: parseFloat(formData.price),
      is_featured: formData.is_featured ? 1 : 0,
      is_active: formData.is_active ? 1 : 0,
    }

    try {
      if (editingPackage) {
        await packagesAPI.update(editingPackage.id, packageData)
      } else {
        await packagesAPI.create(packageData)
      }

      loadPackages()
      closeModal()
    } catch (error) {
      alert('Erro ao salvar pacote')
    }
  }

  const openDeleteModal = (pkg) => {
    setDeleteModal({ show: true, pkg })
    setDeleteConfirmText('')
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, pkg: null })
    setDeleteConfirmText('')
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== 'REMOVER PACOTE') return

    try {
      await packagesAPI.delete(deleteModal.pkg.id)
      loadPackages()
      closeDeleteModal()
    } catch (error) {
      alert('Erro ao deletar pacote')
    }
  }

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.toString(),
        inclusions: pkg.inclusions.length > 0 ? pkg.inclusions : [''],
        image_urls: pkg.image_urls || [],
        is_featured: pkg.is_featured === 1,
        is_active: pkg.is_active === 1,
      })
    } else {
      setEditingPackage(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        inclusions: [''],
        image_urls: [],
        is_featured: false,
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPackage(null)
  }

  const addInclusion = () => {
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, '']
    }))
  }

  const updateInclusion = (index, value) => {
    const newInclusions = [...formData.inclusions]
    newInclusions[index] = value
    setFormData(prev => ({ ...prev, inclusions: newInclusions }))
  }

  const removeInclusion = (index) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Pacotes
            </h1>
            <p className="text-gray-600">Gerencie os pacotes especiais</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Novo Pacote
          </button>
        </div>

        {/* Packages List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="admin-card text-center py-12">
            <p className="text-gray-500">Nenhum pacote cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`admin-card hover:shadow-xl transition-shadow ${
                  !pkg.is_active ? 'opacity-60 border-2 border-dashed border-gray-300 bg-gray-50' : ''
                }`}
              >
                {pkg.image_urls && pkg.image_urls.length > 0 && (
                  <img
                    src={pkg.image_urls[0]}
                    alt={pkg.name}
                    className={`w-full h-48 object-cover rounded-lg mb-4 ${!pkg.is_active ? 'grayscale' : ''}`}
                  />
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-xl font-bold ${pkg.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{pkg.name}</h3>
                  <div className="flex gap-2">
                    {pkg.is_featured === 1 && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-100 text-accent-800">
                        Destaque
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{pkg.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Inclusões:</h4>
                  <ul className="space-y-1">
                    {pkg.inclusions.map((inc, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-primary-500">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(pkg)}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(pkg)}
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPackage ? 'Editar Pacote' : 'Novo Pacote'}
                </h2>
              </div>

              {/* Conteúdo Rolável */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <form id="package-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="input-label">Nome do Pacote</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <label className="input-label">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">Inclusões</label>
                    {formData.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={inclusion}
                          onChange={(e) => updateInclusion(index, e.target.value)}
                          className="input-field"
                          placeholder="Ex: 5 diárias"
                        />
                        {formData.inclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInclusion(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInclusion}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Adicionar inclusão
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="is_featured" className="text-sm text-gray-700">
                        Pacote em destaque
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.is_featured}
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.is_featured ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.is_featured ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="is_active" className="text-sm text-gray-700">
                        Pacote ativo
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
                  </div>
                </form>
              </div>

              {/* Footer Fixo */}
              <div className="px-8 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-4">
                  <button type="submit" form="package-form" className="btn-primary flex-1">
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
                  Remover Pacote
                </h2>
                <p className="text-gray-600">
                  Você está prestes a remover o pacote <strong>"{deleteModal.pkg?.name}"</strong>. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="mb-6">
                <label className="input-label text-center block mb-2">
                  Digite <strong className="text-red-600">REMOVER PACOTE</strong> para confirmar
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input-field text-center"
                  placeholder="REMOVER PACOTE"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'REMOVER PACOTE'}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    deleteConfirmText === 'REMOVER PACOTE'
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

export default Packages
