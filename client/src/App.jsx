import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'

// Public Pages (eager loading for better UX)
import Home from './pages/Home'

// Admin Pages (lazy loading)
const AdminLogin = lazy(() => import('./pages/Admin/Login'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminPromotions = lazy(() => import('./pages/Admin/Promotions'))
const AdminPackages = lazy(() => import('./pages/Admin/Packages'))
const AdminRooms = lazy(() => import('./pages/Admin/Rooms'))
const AdminSiteInfo = lazy(() => import('./pages/Admin/SiteInfo'))
const AdminGallery = lazy(() => import('./pages/Admin/GalleryManager'))

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute'

// Loading component
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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/promotions"
              element={
                <ProtectedRoute>
                  <AdminPromotions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/packages"
              element={
                <ProtectedRoute>
                  <AdminPackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute>
                  <AdminRooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/site-info"
              element={
                <ProtectedRoute>
                  <AdminSiteInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AdminProvider>
  )
}

export default App
