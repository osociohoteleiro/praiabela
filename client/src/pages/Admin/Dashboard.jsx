import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { promotionsAPI, packagesAPI } from '../../services/api'
import {
  TagIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [stats, setStats] = useState({
    promotions: 0,
    packages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [promotionsRes, packagesRes] = await Promise.all([
        promotionsAPI.getAll(),
        packagesAPI.getAll(),
      ])

      setStats({
        promotions: promotionsRes.data.length,
        packages: packagesRes.data.length,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Promoções Ativas',
      value: stats.promotions,
      icon: TagIcon,
      color: 'bg-primary-500',
      link: '/admin/promotions',
    },
    {
      name: 'Pacotes',
      value: stats.packages,
      icon: CubeIcon,
      color: 'bg-secondary-500',
      link: '/admin/packages',
    },
  ]

  return (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao painel administrativo da Pousada Praia Bela
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon

            return (
              <Link
                key={stat.name}
                to={stat.link}
                className="admin-card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <ChartBarIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/promotions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Nova Promoção</h3>
              <p className="text-sm text-gray-600">Criar uma nova promoção para o site</p>
            </Link>

            <Link
              to="/admin/packages"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Novo Pacote</h3>
              <p className="text-sm text-gray-600">Adicionar um novo pacote especial</p>
            </Link>

            <Link
              to="/admin/site-info"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Atualizar Info</h3>
              <p className="text-sm text-gray-600">Editar informações do site</p>
            </Link>
          </div>
        </div>

        {/* Site Preview */}
        <div className="admin-card mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Visualizar Site</h2>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Abrir Site Público
          </a>
        </div>
    </div>
  )
}

export default Dashboard
