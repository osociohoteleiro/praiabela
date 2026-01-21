import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'

// Public Pages (eager loading for better UX)
import Home from './pages/Home'

// Admin Layout (eager loading to prevent flashing)
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Admin Pages (lazy loading)
const AdminLogin = lazy(() => import('./pages/Admin/Login'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminPromotions = lazy(() => import('./pages/Admin/Promotions'))
const AdminPackages = lazy(() => import('./pages/Admin/Packages'))
const AdminRooms = lazy(() => import('./pages/Admin/Rooms'))
const AdminSiteInfo = lazy(() => import('./pages/Admin/SiteInfo'))
const AdminGallery = lazy(() => import('./pages/Admin/GalleryManager'))
const AdminExperiences = lazy(() => import('./pages/Admin/ExperiencesManager'))

// Loading component for login page
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="spinner mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
)

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Admin Login (outside layout) */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />

          {/* Admin Routes with persistent layout */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/promotions" element={<AdminPromotions />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/rooms" element={<AdminRooms />} />
            <Route path="/admin/experiences" element={<AdminExperiences />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/admin/site-info" element={<AdminSiteInfo />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  )
}

export default App
