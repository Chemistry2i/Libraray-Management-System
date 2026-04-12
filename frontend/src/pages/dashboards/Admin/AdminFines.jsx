import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ShieldOff, DollarSign, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

const AdminFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/borrowing/admin/fines', { params: { limit: 100 } });
      const finesData = res.data?.data?.fines || [];
      setFines(finesData);
    } catch (error) {
      console.error('Failed to fetch fines', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load fines data',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const totalOutstanding = fines.reduce((sum, fine) => sum + Number(fine.fine_amount), 0);

  const handleWaiveFine = async (borrowId) => {
    try {
      const result = await Swal.fire({
        title: 'Waive Fine?',
        text: "This will set the patron's fine for this record to zero. This cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Yes, waive it',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });

      if (result.isConfirmed) {
        await api.patch(`/borrowing/admin/fines/${borrowId}/waive`);
        Swal.fire({
          title: 'Waived!',
          text: 'The fine has been waived.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        fetchFines();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to waive fine',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    }
  };

  const filteredFines = fines.filter(f => {
    const term = searchTerm.toLowerCase();
    return (
      f.username?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term) ||
      f.borrow_id?.toString().includes(term) ||
      f.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines & Billing</h1>
          <p className="text-gray-500 mt-1">Manage patron balances, process payments, and waive fees.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Outstanding Total</p>
            <p className="text-lg font-bold text-gray-900">${totalOutstanding.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by patron, title, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="mt-4 text-sm font-medium text-gray-600">Loading fines data...</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Borrow ID & Due Date</th>
                <th className="p-4 font-semibold">Patron Details</th>
                <th className="p-4 font-semibold w-1/3">Book</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredFines.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No outstanding fines found. All clear!
                  </td>
                </tr>
              ) : (
                filteredFines.map((fine) => (
                  <tr key={fine.borrow_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 w-max">
                        BW-{fine.borrow_id.toString().padStart(4, '0')}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Due: {new Date(fine.due_date).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{fine.username}</div>
                      <div className="text-xs text-gray-500">{fine.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{fine.title}</td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-gray-900">${Number(fine.fine_amount).toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">Unpaid Fine</span>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button 
                          onClick={() => handleWaiveFine(fine.borrow_id)}
                          className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Waive Fine">
                          <ShieldOff size={18} />
                        </button>
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

export default AdminFines;
