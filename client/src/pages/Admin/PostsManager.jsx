import { useEffect, useState, useRef } from 'react'
import { postsAPI, mediaAPI } from '../../services/api'
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  NewspaperIcon,
  CloudArrowUpIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

const emptyForm = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  published_at: '',
  is_active: 1,
  coverFile: null,
  coverPreview: '',
  cover_image: '',
}

const PostsManager = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, post: null })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [newForm, setNewForm] = useState(emptyForm)

  const fileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await postsAPI.getAllAdmin()
      setPosts(res.data)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file, isEdit = false) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if (isEdit) {
        setEditing({ ...editing, newFile: file, newPreview: e.target.result })
      } else {
        setNewForm({ ...newForm, coverFile: file, coverPreview: e.target.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e, isEdit = false) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], isEdit)
    }
  }

  const handleAdd = async () => {
    if (!newForm.title || !newForm.content) {
      alert('Preencha o título e o conteúdo')
      return
    }
    if (!newForm.coverFile && !newForm.cover_image) {
      alert('Selecione uma imagem de capa')
      return
    }
    setUploading(true)
    try {
      let coverUrl = newForm.cover_image
      if (newForm.coverFile) {
        const formData = new FormData()
        formData.append('image', newForm.coverFile)
        const uploadRes = await mediaAPI.uploadImage(formData)
        coverUrl = uploadRes.data.url
      }
      await postsAPI.create({
        title: newForm.title,
        slug: newForm.slug || undefined,
        excerpt: newForm.excerpt || null,
        content: newForm.content,
        cover_image: coverUrl,
        category: newForm.category || null,
        published_at: newForm.published_at || null,
        is_active: newForm.is_active,
      })
      setShowAddModal(false)
      setNewForm(emptyForm)
      loadData()
    } catch (error) {
      console.error('Error adding post:', error)
      alert('Erro ao adicionar postagem')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    if (!editing.title || !editing.content) {
      alert('Preencha o título e o conteúdo')
      return
    }
    setUploading(true)
    try {
      let coverUrl = editing.cover_image
      if (editing.newFile) {
        const formData = new FormData()
        formData.append('image', editing.newFile)
        const uploadRes = await mediaAPI.uploadImage(formData)
        coverUrl = uploadRes.data.url
      }
      await postsAPI.update(editing.id, {
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt || null,
        content: editing.content,
        cover_image: coverUrl,
        category: editing.category || null,
        published_at: editing.published_at || null,
        is_active: editing.is_active,
      })
      setShowEditModal(false)
      setEditing(null)
      loadData()
    } catch (error) {
      console.error('Update error:', error)
      alert('Erro ao atualizar postagem')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.post || deleteConfirmText !== 'REMOVER') return
    try {
      await postsAPI.delete(deleteModal.post.id)
      setDeleteModal({ show: false, post: null })
      setDeleteConfirmText('')
      loadData()
    } catch {
      alert('Erro ao remover postagem')
    }
  }

  const handleToggleActive = async (post) => {
    try {
      await postsAPI.update(post.id, {
        ...post,
        is_active: post.is_active ? 0 : 1,
      })
      loadData()
    } catch {
      alert('Erro ao alterar visibilidade')
    }
  }

  const openEditModal = (post) => {
    setEditing({
      ...post,
      published_at: post.published_at ? post.published_at.slice(0, 10) : '',
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (post) => {
    setDeleteModal({ show: true, post })
    setDeleteConfirmText('')
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-600">Gerencie as postagens do blog público</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nova Postagem
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-card text-center py-12">
          <NewspaperIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma postagem cadastrada</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Criar primeira postagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`admin-card group relative ${!post.is_active ? 'opacity-50' : ''}`}
            >
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                {!post.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">RASCUNHO</span>
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {post.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {post.excerpt || post.content?.slice(0, 120)}
              </p>

              <p className="text-xs text-gray-400 mb-4 truncate">/{post.slug}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleActive(post)}
                  className={`p-2 rounded-lg ${
                    post.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={post.is_active ? 'Despublicar' : 'Publicar'}
                >
                  {post.is_active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditModal(post)}
                  className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                  title="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(post)}
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

      {/* Add Modal */}
      {showAddModal && (
        <PostFormModal
          mode="add"
          form={newForm}
          setForm={setNewForm}
          onClose={() => {
            setShowAddModal(false)
            setNewForm(emptyForm)
          }}
          onSubmit={handleAdd}
          uploading={uploading}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={(e) => handleDrop(e, false)}
          fileInputRef={fileInputRef}
          handleFileSelect={(file) => handleFileSelect(file, false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editing && (
        <PostFormModal
          mode="edit"
          form={editing}
          setForm={setEditing}
          onClose={() => {
            setShowEditModal(false)
            setEditing(null)
          }}
          onSubmit={handleUpdate}
          uploading={uploading}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={(e) => handleDrop(e, true)}
          fileInputRef={editFileInputRef}
          handleFileSelect={(file) => handleFileSelect(file, true)}
        />
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Remoção</h2>
            {deleteModal.post && (
              <div className="mb-4">
                <img
                  src={deleteModal.post.cover_image}
                  alt={deleteModal.post.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="font-medium text-gray-900">{deleteModal.post.title}</p>
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
                  setDeleteModal({ show: false, post: null })
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

const PostFormModal = ({
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
  uploading,
  dragActive,
  handleDrag,
  handleDrop,
  fileInputRef,
  handleFileSelect,
}) => {
  const isEdit = mode === 'edit'
  const currentImage =
    (isEdit && (form.newPreview || form.cover_image)) || form.coverPreview || form.cover_image

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Editar Postagem' : 'Nova Postagem'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: 5 atrações imperdíveis em Ilhéus"
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <TagIcon className="w-4 h-4" /> Categoria
              </label>
              <input
                type="text"
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ex: Dicas, Eventos, Gastronomia"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" /> Data de publicação
              </label>
              <input
                type="date"
                value={form.published_at || ''}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={form.slug || ''}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-field w-full font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">/blog/{form.slug || '...'}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo (opcional)
            </label>
            <textarea
              value={form.excerpt || ''}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Breve descrição exibida nos cards. Se vazio, usa o início do conteúdo."
              rows={2}
              className="input-field w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo *</label>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escreva o texto da postagem. Use linhas em branco para separar parágrafos."
              rows={12}
              className="input-field w-full resize-y leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Parágrafos são separados por linha em branco.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de capa {!isEdit && '*'}
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : currentImage
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              {currentImage ? (
                <div className="space-y-3">
                  <img
                    src={currentImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Trocar imagem
                  </button>
                </div>
              ) : (
                <div className="cursor-pointer py-6" onClick={() => fileInputRef.current?.click()}>
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-gray-400 text-sm">JPG, PNG, WEBP (máx. 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Publicado (visível no site)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : isEdit ? (
              'Salvar'
            ) : (
              'Publicar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostsManager
