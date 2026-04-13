import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations', { params: { limit: 100 } });
      // Handle various response structures
      const data = res.data?.data || res.data || [];
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
      setReservations([]); // Ensure it's always an array
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reservations data',
        customClass: { popup: 'rounded-[4px]' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleMarkReady = async (reservationId) => {
    try {
      const result = await Swal.fire({
        title: 'Mark as Ready?',
        text: 'This will notify the patron that the book is ready for pickup.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Yes, mark ready',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });

      if (result.isConfirmed) {
        await api.patch('/reservations/ready', { reservationId });
        Swal.fire({
          title: 'Success!',
          text: 'Reservation marked as ready.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        fetchReservations();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update reservation',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const result = await Swal.fire({
        title: 'Cancel Reservation?',
        text: "You are about to cancel this hold request. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Yes, cancel it!',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });

      if (result.isConfirmed) {
        await api.delete(`/reservations/admin/${reservationId}`);
        Swal.fire({
          title: 'Cancelled!',
          text: 'Reservation has been cancelled.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        fetchReservations();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to cancel reservation',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'ready':
        return <span className="bg-blue-50 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-full text-xs font-medium">Ready</span>;
      case 'pending':
        return <span className="bg-yellow-50 text-yellow-700 border-yellow-200 border px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1"><AlertCircle size={12}/> Pending</span>;
      case 'fulfilled':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Fulfilled</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      case 'expired':
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">Expired</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const filteredReservations = Array.isArray(reservations) 
    ? reservations.filter(r => {
        const term = searchTerm.toLowerCase();
        return (
          r.title?.toLowerCase().includes(term) ||
          r.username?.toLowerCase().includes(term) ||
          r.email?.toLowerCase().includes(term) ||
          r.reservation_id?.toString().includes(term)
        );
      })
    : [];

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holds & Reservations</h1>
          <p className="text-gray-500 mt-1">Manage book hold requests and waitlist queues.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by patron, book, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchReservations}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-[4px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-[4px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Loading reservations...</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">ID & Date</th>
                <th className="p-4 font-semibold">Patron</th>
                <th className="p-4 font-semibold hidden md:table-cell">Book Requested</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredReservations.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.reservation_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">RES-{res.reservation_id.toString().padStart(4, '0')}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(res.reservation_date).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      <div>{res.username}</div>
                      <div className="text-xs text-gray-500 font-normal">{res.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell font-medium">
                      {res.title}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        {res.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleMarkReady(res.reservation_id)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Mark as Ready">
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleCancelReservation(res.reservation_id)}
                              className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Cancel Request">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {res.status === 'ready' && (
                           <button 
                             onClick={() => handleCancelReservation(res.reservation_id)}
                             className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Cancel Request">
                             <XCircle size={18} />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
