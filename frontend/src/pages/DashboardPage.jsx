import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import UserDashboard from '../components/dashboard/UserDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  
  if (!user) return null

  const isAdmin = user.role === 'admin' || user.role === 'librarian'

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-7xl mx-auto px-4">
        {isAdmin ? (
          <AdminDashboard user={user} />
        ) : (
          <UserDashboard user={user} />
        )}
      </div>
    </div>
  )
}
