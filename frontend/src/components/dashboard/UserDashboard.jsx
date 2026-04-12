import React from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookReader, faBookmark, faWallet, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../EmptyState'

export default function UserDashboard({ user }) {
  const navigate = useNavigate()
  const stats = [
    { title: 'Books Borrowed', value: '0', icon: faBookReader, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Reservations', value: '0', icon: faBookmark, color: 'text-pink-500', bg: 'bg-pink-50' },
    { title: 'Total Read', value: '0', icon: faChartLine, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Pending Fines', value: '$0.00', icon: faWallet, color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">My Library</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
        <button onClick={() => navigate('/books')} className="btn-primary px-6 py-2.5">
          Browse Catalog
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
            className="bg-white p-6 rounded-2xl shadow-airbnb border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <FontAwesomeIcon icon={stat.icon} className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Currently Reading */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-airbnb border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Currently Reading</h2>
          <EmptyState 
            icon={faBookReader}
            title="No Active Borrows"
            description="You haven't borrowed any books at the moment. Explore our catalog to find your next great read."
          />
        </div>

        {/* My Reservations */}
        <div className="bg-white rounded-2xl shadow-airbnb border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-dark mb-4">My Reservations</h2>
          <EmptyState 
            icon={faBookmark}
            title="No Reservations"
            description="You don't have any pending reservations."
          />
        </div>
      </div>
    </div>
  )
}