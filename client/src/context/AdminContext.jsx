import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AdminContext = createContext(null)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    verifyToken()
  }, [])

  const verifyToken = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const { data } = await authAPI.verify()
      setIsAuthenticated(true)
      setAdmin(data.admin)
    } catch (error) {
      localStorage.removeItem('admin_token')
      setIsAuthenticated(false)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('admin_token', data.token)
      setIsAuthenticated(true)
      setAdmin(data.admin)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setAdmin(null)
  }

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
