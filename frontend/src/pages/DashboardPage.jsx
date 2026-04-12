import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    const isAdmin = user.role === 'admin' || user.role === 'librarian'
    if (isAdmin) {
      navigate('/admin', { replace: true })
    } else {
      navigate('/user', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-light py-12 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
