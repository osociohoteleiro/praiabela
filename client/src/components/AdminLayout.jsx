import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import {
  HomeIcon,
  TagIcon,
  CubeIcon,
  HomeModernIcon,
  InformationCircleIcon,
  ArrowLeftOnRectangleIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, admin } = useAdmin()

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Promoções', path: '/admin/promotions', icon: TagIcon },
    { name: 'Pacotes', path: '/admin/packages', icon: CubeIcon },
    { name: 'Quartos', path: '/admin/rooms', icon: HomeModernIcon },
    { name: 'Info do Site', path: '/admin/site-info', icon: InformationCircleIcon },
    { name: 'Galeria', path: '/admin/gallery', icon: RectangleStackIcon },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-gray-800">
            <h1 className="font-display text-2xl font-bold text-gradient-warm">
              Praia Bela
            </h1>
            <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User & Logout */}
          <div className="px-4 py-6 border-t border-gray-800">
            <div className="px-4 py-3 bg-gray-800 rounded-lg mb-3">
              <p className="text-sm text-gray-400">Logado como:</p>
              <p className="font-semibold truncate">{admin?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
