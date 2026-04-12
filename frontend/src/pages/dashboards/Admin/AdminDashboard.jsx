import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, AlertCircle, Plus, CheckCircle, Settings, ArrowRight, TrendingUp, UserPlus, BookMarked } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import WelcomeBanner from './components/WelcomeBanner';
import StatCard from './components/StatCard';

const borrowingData = [
  { name: 'Mon', borrows: 12, returns: 8 },
  { name: 'Tue', borrows: 19, returns: 15 },
  { name: 'Wed', borrows: 15, returns: 12 },
  { name: 'Thu', borrows: 22, returns: 18 },
  { name: 'Fri', borrows: 28, returns: 20 },
  { name: 'Sat', borrows: 35, returns: 25 },
  { name: 'Sun', borrows: 30, returns: 22 },
];

const recentActivities = [
  { id: 1, type: 'borrow', message: 'Sarah Connor borrowed "The Pragmatic Programmer"', time: '10 mins ago', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'user', message: 'New patron account created for John Wick', time: '1 hour ago', icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 3, type: 'return', message: 'Ellen Ripley returned 3 overdue books', time: '2 hours ago', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, type: 'alert', message: 'System backup completed successfully', time: '5 hours ago', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-50' },
];

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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> 
                Borrowing Overview
              </h2>
              <p className="text-sm text-gray-500">Number of books borrowed vs returned this week</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={borrowingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="borrows" name="Borrows" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                <Area type="monotone" dataKey="returns" name="Returns" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-blue-600 group-hover:text-primary transition-colors">
                <Plus size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Add New Book</span>
                <span className="block text-xs text-gray-500">Register a new title to inventory</span>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-green-600 group-hover:text-primary transition-colors">
                <CheckCircle size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Approve Holds</span>
                <span className="block text-xs text-gray-500">3 reservations pending review</span>
              </div>
            </button>

            <button className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-purple-600 group-hover:text-primary transition-colors">
                <Users size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Manage Patrons</span>
                <span className="block text-xs text-gray-500">View and edit user accounts</span>
              </div>
            </button>

            <button className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-gray-600 group-hover:text-primary transition-colors">
                <Settings size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">System Settings</span>
                <span className="block text-xs text-gray-500">Configure library policies</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-primary font-semibold hover:text-primary-dark flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Timeline connector */}
                  {index !== recentActivities.length - 1 && (
                    <div className="absolute top-10 left-5 bottom-[-24px] w-px bg-gray-200"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex justify-center items-center shrink-0 z-10 \${activity.bg} \${activity.color} ring-4 ring-white`}>
                    <Icon size={18} />
                  </div>
                  
                  <div className="flex flex-col justify-center pt-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Needs Attention Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="text-red-500" />
          Needs Attention
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-800">5 Overdue Books</span>
              <span className="text-xs text-red-600">Action required</span>
            </div>
            <button className="bg-white text-xs font-bold text-red-600 px-3 py-1.5 rounded shadow-sm border border-red-200 hover:bg-gray-50 transition-colors">
              Review
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-orange-800">12 Pending Reservations</span>
              <span className="text-xs text-orange-600">Awaiting approval</span>
            </div>
            <button className="bg-white text-xs font-bold text-orange-600 px-3 py-1.5 rounded shadow-sm border border-orange-200 hover:bg-gray-50 transition-colors">
              Review
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-amber-800">$45.00 Unpaid Fines</span>
              <span className="text-xs text-amber-700">From 3 patrons</span>
            </div>
            <button className="bg-white text-xs font-bold text-amber-700 px-3 py-1.5 rounded shadow-sm border border-amber-200 hover:bg-gray-50 transition-colors">
              Review
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
  );
};

export default AdminDashboard;
