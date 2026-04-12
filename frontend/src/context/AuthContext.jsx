import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/endpoints'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      let userData = response.data.data?.user || response.data.data;
      
      // Map backend snake_case to camelCase
      if (userData) {
        userData = {
          ...userData,
          firstName: userData.first_name,
          lastName: userData.last_name,
          userId: userData.user_id,
          profileImage: userData.profile_image_url
        }
      }

      setUser(userData)
      setIsAuthenticated(true)
      return userData;
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      throw error;
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      localStorage.setItem('token', response.data.data.token)
      const userData = await checkAuth()
      return userData
    } catch (error) {
      throw error
    }
  }

  const register = async (userDataInput) => {
    try {
      const response = await authAPI.register(userDataInput)
      localStorage.setItem('token', response.data.data.token)
      const userData = await checkAuth()
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
