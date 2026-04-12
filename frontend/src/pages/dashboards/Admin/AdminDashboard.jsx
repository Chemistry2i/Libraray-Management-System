import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, AlertCircle, Plus, CheckCircle, Settings, ArrowRight, TrendingUp, UserPlus, BookMarked, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import WelcomeBanner from './components/WelcomeBanner';
import StatCard from './components/StatCard';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([
    { name: 'Mon', borrows: 0, uniqueUsers: 0 },
    { name: 'Tue', borrows: 0, uniqueUsers: 0 },
    { name: 'Wed', borrows: 0, uniqueUsers: 0 },
    { name: 'Thu', borrows: 0, uniqueUsers: 0 },
    { name: 'Fri', borrows: 0, uniqueUsers: 0 },
    { name: 'Sat', borrows: 0, uniqueUsers: 0 },
    { name: 'Sun', borrows: 0, uniqueUsers: 0 }
  ]);
  const [finesInfo, setFinesInfo] = useState({ count: 0, amount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard report and activity
        const [reportRes, activityRes, finesRes] = await Promise.all([
          api.get('/dashboard/report'),
          api.get('/dashboard/activity?days=7'),
          api.get('/borrowing/admin/fines')
        ]);
        
        const report = reportRes.data?.data?.report || {};
        setStats(report.overview);
        
        // Format chart data (mapping checkouts instead of borrows/returns)
        const recentActivity = activityRes.data?.data?.activity || [];
        
        // Ensure we have 7 days of data points even if some days have 0
        const formattedChartData = [...recentActivity].reverse().map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          borrows: item.checkouts || 0,
          uniqueUsers: item.unique_users || 0
        }));
        
        setChartData(formattedChartData.length > 0 ? formattedChartData : [
          { name: 'Mon', borrows: 0, uniqueUsers: 0 },
          { name: 'Tue', borrows: 0, uniqueUsers: 0 },
          { name: 'Wed', borrows: 0, uniqueUsers: 0 },
          { name: 'Thu', borrows: 0, uniqueUsers: 0 },
          { name: 'Fri', borrows: 0, uniqueUsers: 0 },
          { name: 'Sat', borrows: 0, uniqueUsers: 0 },
          { name: 'Sun', borrows: 0, uniqueUsers: 0 }
        ]);

        // Calculate Fines
        const finesList = finesRes.data?.data?.fines || [];
        const totalFineAmount = finesList.reduce((sum, fine) => sum + Number(fine.fine_amount), 0);
        setFinesInfo({ count: finesList.length, amount: totalFineAmount });

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Dummy recent activities for Visuals (since there isn't a comprehensive system logs endpoint yet)
  const recentActivities = [
    { id: 1, type: 'alert', message: 'System boot and synchronization valid', time: '10 mins ago', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  return (
    <div className="py-2">
      <WelcomeBanner user={user || { firstName: 'Admin', role: 'admin' }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.total_users || 0} 
          icon={<Users size={24} />} 
          color="blue"
          subtext="Registered patrons & staff"
        />
        <StatCard 
          title="Active Borrowings" 
          value={stats.active_borrows || 0} 
          icon={<BookOpen size={24} />} 
          color="green"
          subtext="Books currently checked out"
        />
        <StatCard 
          title="Pending Reservations" 
          value={stats.pending_reservations || 0} 
          icon={<Clock size={24} />} 
          color="purple"
          subtext="Requires approval/fulfillment"
        />
        <StatCard 
          title="Overdue Books" 
          value={stats.overdue_books || 0} 
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
              <p className="text-sm text-gray-500">Number of books borrowed (7 Days)</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20">
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="borrows" name="Checkouts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                <Area type="monotone" dataKey="uniqueUsers" name="Unique Borrowers" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/admin/books" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-blue-600 group-hover:text-primary transition-colors">
                <Plus size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Add New Book</span>
                <span className="block text-xs text-gray-500">Register a new title to inventory</span>
              </div>
            </Link>
            
            <Link to="/admin/reservations" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-green-600 group-hover:text-primary transition-colors">
                <CheckCircle size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Approve Holds</span>
                <span className="block text-xs text-gray-500">{stats.pending_reservations || 0} reservations pending</span>
              </div>
            </Link>

            <Link to="/admin/users" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-purple-600 group-hover:text-primary transition-colors">
                <Users size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">Manage Patrons</span>
                <span className="block text-xs text-gray-500">View and edit user accounts</span>
              </div>
            </Link>

            <Link to="/admin/settings" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary border border-gray-200 transition-all text-left group">
              <div className="p-2 bg-white rounded-md shadow-sm text-gray-600 group-hover:text-primary transition-colors">
                <Settings size={18} />
              </div>
              <div>
                <span className="block font-semibold text-gray-900 text-sm">System Settings</span>
                <span className="block text-xs text-gray-500">Configure library policies</span>
              </div>
            </Link>
          </div>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Logging Activity</h2>
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
                  
                  <div className={`w-10 h-10 rounded-full flex justify-center items-center shrink-0 z-10 ${activity.bg} ${activity.color} ring-4 ring-white`}>
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
              <span className="text-sm font-bold text-red-800">{stats.overdue_books || 0} Overdue Books</span>
              <span className="text-xs text-red-600">Action required</span>
            </div>
            <Link to="/admin/borrowing" className="bg-white text-xs font-bold text-red-600 px-3 py-1.5 rounded shadow-sm border border-red-200 hover:bg-gray-50 transition-colors">
              Review
            </Link>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-orange-800">{stats.pending_reservations || 0} Pending Reservations</span>
              <span className="text-xs text-orange-600">Awaiting approval</span>
            </div>
            <Link to="/admin/reservations" className="bg-white text-xs font-bold text-orange-600 px-3 py-1.5 rounded shadow-sm border border-orange-200 hover:bg-gray-50 transition-colors">
              Review
            </Link>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-amber-800">${finesInfo.amount.toFixed(2)} Unpaid Fines</span>
              <span className="text-xs text-amber-700">From {finesInfo.count} active records</span>
            </div>
            <Link to="/admin/fines" className="bg-white text-xs font-bold text-amber-700 px-3 py-1.5 rounded shadow-sm border border-amber-200 hover:bg-gray-50 transition-colors">
              Review
            </Link>
          </div>
        </div>
      </div>

    </div>
  </div>
  );
};

export default AdminDashboard;
