import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, AlertCircle } from 'lucide-react';
import WelcomeBanner from './components/WelcomeBanner';
import StatCard from './components/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBorrowings: 0,
    pendingReservations: 0,
    overdueBooks: 0
  });

  // Dummy user data
  const user = { firstName: 'Admin', role: 'admin' };

  useEffect(() => {
    // In a real app, you would fetch these from your dashboard api endpoint
    // E.g. /api/dashboard/admin
    setStats({
      totalUsers: 145,
      activeBorrowings: 32,
      pendingReservations: 12,
      overdueBooks: 5
    });
  }, []);

  return (
    <div className="py-2">
      <WelcomeBanner user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users size={24} />} 
          color="blue"
          subtext="+12 this month"
        />
        <StatCard 
          title="Active Borrowings" 
          value={stats.activeBorrowings} 
          icon={<BookOpen size={24} />} 
          color="green"
          subtext="8 due today"
        />
        <StatCard 
          title="Pending Reservations" 
          value={stats.pendingReservations} 
          icon={<Clock size={24} />} 
          color="purple"
          subtext="Requires approval"
        />
        <StatCard 
          title="Overdue Books" 
          value={stats.overdueBooks} 
          icon={<AlertCircle size={24} />} 
          color="red"
          subtext="Action needed"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Loading activity...</p>
            {/* List items will go here */}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <span className="font-medium text-gray-700">Add New Book</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <span className="font-medium text-gray-700">Manage Users</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <span className="font-medium text-gray-700">Approve Reservations</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <span className="font-medium text-gray-700">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
