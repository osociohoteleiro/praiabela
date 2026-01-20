import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
}

// Promotions endpoints
export const promotionsAPI = {
  getAll: () => api.get('/promotions'),
  getById: (id) => api.get(`/promotions/${id}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.put(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
}

// Packages endpoints
export const packagesAPI = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
}

// Rooms endpoints
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getAllAdmin: () => api.get('/rooms/admin/all'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
}

// Site Info endpoints
export const siteInfoAPI = {
  get: () => api.get('/site-info'),
  update: (data) => api.put('/site-info', data),
}

// Media/Upload endpoints
export const mediaAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVideo: (formData) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/media'),
  delete: (key) => api.delete(`/upload/${key}`),
}

// Gallery endpoints
export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  getAllAdmin: () => api.get('/gallery/admin/all'),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
  reorder: (items) => api.put('/gallery/reorder/batch', { items }),
}

export default api
