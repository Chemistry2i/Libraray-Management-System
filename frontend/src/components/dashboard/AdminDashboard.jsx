import React from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faUsers, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import EmptyState from '../EmptyState'

export default function AdminDashboard({ user }) {
  const stats = [
    { title: 'Total Books', value: '1,248', icon: faBookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Active Users', value: '342', icon: faUsers, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Current Borrows', value: '89', icon: faClock, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Pending Fines', value: '12', icon: faExclamationTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName} (Librarian/Admin)</p>
        </div>
        <button className="btn-primary px-6 py-2.5">
          Add New Book
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-airbnb border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Pending Approvals */}
        <div className="bg-white rounded-2xl shadow-airbnb border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Pending Approvals</h2>
          <EmptyState 
            icon={faClock}
            title="No Pending Approvals"
            description="All book requests and returns have been processed. Excellent work!"
          />
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-2xl shadow-airbnb border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-dark mb-4">System Alerts</h2>
          <EmptyState 
            icon={faExclamationTriangle}
            title="All Clear"
            description="There are no system alerts or overdue books that need immediate attention."
          />
        </div>
      </div>
    </div>
  )
}