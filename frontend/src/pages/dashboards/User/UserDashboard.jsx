import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, Wallet, TrendingUp, AlertCircle, Library, Calendar, User as UserIcon } from 'lucide-react';
import { borrowingAPI, reservationAPI } from '../../../api/endpoints';
import UserWelcomeBanner from './components/UserWelcomeBanner';
import Swal from 'sweetalert2';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      console.log('Fetching user stats for user_id:', user.user_id);
      const statsResponse = await borrowingAPI.getUserStats(user.user_id);
      console.log('Full stats response:', statsResponse);
      const statsData = statsResponse.data?.data?.stats || statsResponse.data?.data || statsResponse.data;
      console.log('Extracted stats data:', statsData);
      
      // Fetch active books
      console.log('Fetching active books');
      const booksResponse = await borrowingAPI.getMyBooks();
      console.log('Full books response:', booksResponse);
      let activeBooks = [];
      if (booksResponse.data?.data?.books) {
        activeBooks = booksResponse.data.data.books;
      } else if (booksResponse.data?.data?.items) {
        activeBooks = booksResponse.data.data.items;
      } else if (Array.isArray(booksResponse.data?.data)) {
        activeBooks = booksResponse.data.data;
      } else if (Array.isArray(booksResponse.data?.books)) {
        activeBooks = booksResponse.data.books;
      } else if (Array.isArray(booksResponse.data?.items)) {
        activeBooks = booksResponse.data.items;
      }
      console.log('Extracted active books:', activeBooks);
      
      // Fetch reservations
      console.log('Fetching reservations');
      const reservationsResponse = await reservationAPI.getMyReservations();
      console.log('Full reservations response:', reservationsResponse);
      let reservations = [];
      if (reservationsResponse.data?.data?.items) {
        reservations = reservationsResponse.data.data.items;
      } else if (reservationsResponse.data?.data?.reservations) {
        reservations = reservationsResponse.data.data.reservations;
      } else if (Array.isArray(reservationsResponse.data?.data)) {
        reservations = reservationsResponse.data.data;
      }
      console.log('Extracted reservations:', reservations);
      
      setStats({
        booksBorrowed: statsData?.active_count || 0,
        reservations: reservations?.length || 0,
        totalFines: statsData?.total_fines || 0,
        booksRead: statsData?.returned_count || 0,
        currentlyReading: Array.isArray(activeBooks) ? activeBooks : [],
        recentReservations: Array.isArray(reservations) ? reservations.slice(0, 5) : [],
        overdueCount: statsData?.overdue_count || 0,
        pendingRequests: statsData?.pending_count || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      console.error('Error details:', error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load dashboard data',
        timer: 3000,
      });
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Books Borrowed', value: stats?.booksBorrowed || 0, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Reservations', value: stats?.reservations || 0, icon: Bookmark, color: 'text-pink-500', bg: 'bg-pink-50' },
    { title: 'Books Read', value: stats?.booksRead || 0, icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Pending Fines', value: `$${(parseFloat(stats?.totalFines) || 0).toFixed(2)}`, icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <UserWelcomeBanner user={user || { firstName: 'Guest' }} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {user?.firstName}!</h1>
          <p className="text-sm text-gray-500 mt-1">Here is what is happening with your library account today.</p>
        </div>
        <button 
          onClick={() => navigate('/books')}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Library size={18} />
          Browse Catalog
        </button>
      </div>

      {stats?.overdueCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-4">
          <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-yellow-900">Overdue Books Warning</h4>
            <p className="text-yellow-700 text-sm mt-1">You have {stats.overdueCount} overdue book{stats.overdueCount !== 1 ? 's' : ''}. Please return them as soon as possible.</p>
            <button 
              onClick={() => navigate('/user/my-books')}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              View My Books &rarr;
            </button>
          </div>
        </div>
      )}

      {stats?.totalFines > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Outstanding Fines Warning</h4>
            <p className="text-red-700 text-sm mt-1">You have ${stats.totalFines.toFixed(2)} in pending fines. Please clear them to restore full borrowing privileges.</p>
            <button 
              onClick={() => navigate('/user/fines')}
              className="mt-3 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              View Fines &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-gray-900">{loading ? '-' : stat.value}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Reading */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Currently Reading</h2>
              <p className="text-sm text-gray-500 mt-1">Books you hold right now</p>
            </div>
            <button 
              onClick={() => navigate('/user/my-books')}
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            {!loading && (!stats?.currentlyReading || stats.currentlyReading.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-12 flex-1 border-2 border-dashed border-gray-100 rounded-xl">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={28} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No Active Borrows</h3>
                <p className="text-gray-500 text-sm max-w-[250px]">You haven't borrowed any books at the moment.</p>
                <button 
                  onClick={() => navigate('/books')}
                  className="mt-6 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Find a book
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stats?.currentlyReading?.map((book) => (
                  <div key={book.borrow_id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{book.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{book.author}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Due: {new Date(book.due_date).toLocaleDateString()}
                        </span>
                        {book.status === 'overdue' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-medium">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Reservations */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Reservations</h2>
            <button 
              onClick={() => navigate('/user/reservations')}
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            {!loading && (!stats?.recentReservations || stats.recentReservations.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-12 flex-1 border-2 border-dashed border-gray-100 rounded-xl">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bookmark size={20} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No Reservations</h3>
                <p className="text-gray-500 text-sm">No books on hold.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentReservations?.map((reservation) => (
                  <div key={reservation.reservation_id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                    <Bookmark size={16} className="text-purple-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-purple-900 text-sm truncate">{reservation.title || 'Book'}</h4>
                      <p className="text-xs text-purple-700 mt-1">
                        {reservation.author && `by ${reservation.author} • `}Reserved on {new Date(reservation.reservation_date).toLocaleDateString()}
                      </p>
                      {reservation.status && (
                        <p className={`text-xs font-medium mt-1 ${
                          reservation.status === 'available' ? 'text-green-700' : reservation.status === 'pending' ? 'text-blue-700' : 'text-amber-700'
                        }`}>
                          {reservation.status === 'available' ? '✓ Ready to Pickup' : reservation.status === 'pending' ? '⏳ Pending' : `Position: #${reservation.queue_position || 'N/A'}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
