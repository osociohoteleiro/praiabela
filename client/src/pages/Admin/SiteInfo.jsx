import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { siteInfoAPI } from '../../services/api'

const SiteInfo = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    about_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
    facebook_url: '',
    instagram_url: '',
    whatsapp_number: '',
    hero_video_url: '',
    logo_url: '',
  })

  useEffect(() => {
    loadSiteInfo()
  }, [])

  const loadSiteInfo = async () => {
    try {
      const { data } = await siteInfoAPI.get()
      setFormData(data)
    } catch (error) {
      console.error('Error loading site info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await siteInfoAPI.update(formData)
      alert('Informações atualizadas com sucesso!')
    } catch (error) {
      alert('Erro ao atualizar informações')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Informações do Site
          </h1>
          <p className="text-gray-600">Atualize as informações exibidas no site público</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* About Section */}
          <div className="admin-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre a Pousada</h2>
            <div>
              <label className="input-label">Texto "Sobre"</label>
              <textarea
                name="about_text"
                value={formData.about_text}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Descreva a pousada..."
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="admin-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Telefone</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Endereço</label>
                <input
                  type="text"
                  name="contact_address"
                  value={formData.contact_address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Check-in/out Times */}
          <div className="admin-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Horários</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Horário de Check-in</label>
                <input
                  type="time"
                  name="check_in_time"
                  value={formData.check_in_time}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Horário de Check-out</label>
                <input
                  type="time"
                  name="check_out_time"
                  value={formData.check_out_time}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="admin-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Redes Sociais</h2>
            <div className="space-y-6">
              <div>
                <label className="input-label">Facebook URL</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://facebook.com/praiabela"
                />
              </div>

              <div>
                <label className="input-label">Instagram URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://instagram.com/praiabela"
                />
              </div>

              <div>
                <label className="input-label">WhatsApp (com código do país)</label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="5573987654321"
                />
                <p className="text-sm text-gray-500 mt-1">Formato: código do país + DDD + número (sem espaços ou caracteres especiais)</p>
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="admin-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mídia</h2>
            <div className="space-y-6">
              <div>
                <label className="input-label">URL do Vídeo Hero</label>
                <input
                  type="url"
                  name="hero_video_url"
                  value={formData.hero_video_url || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="URL do vídeo no S3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Faça upload do vídeo na seção "Mídia" e cole o URL aqui
                </p>
              </div>

              <div>
                <label className="input-label">URL do Logo</label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="URL do logo no S3"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default SiteInfo
