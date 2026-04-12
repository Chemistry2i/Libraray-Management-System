import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Eye, AlertCircle, DollarSign, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';

const AdminBorrowing = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/borrowings/admin/all?limit=100');
      setBorrowings(data?.data?.items || data?.data?.records || data?.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch borrowing records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = (borrowId) => {
    Swal.fire({
      title: 'Confirm Return',
      text: "Mark this book as returned by the patron?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span class="text-gray-700">Cancel</span>',
      confirmButtonText: 'Yes, Mark Returned'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Fire admin override return
          const res = await api.post(`/borrowings/admin/return/${borrowId}`);
          
          if (res.data?.data?.fine > 0) {
            Swal.fire('Returned with Fines!', `Book returned successfully, but a fine of $${res.data.data.fine} was levied for late return.`, 'warning');
          } else {
            Swal.fire('Returned!', 'The book has been marked as returned.', 'success');
          }
          fetchBorrowings();
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Failed to return book', 'error');
        }
      }
    });
  };

  const handleIssueBookMock = () => {
    Swal.fire({
      title: 'Issue Book Workflow',
      text: 'Currently, books must be requested by the Patron within their portal. Administrators then approve those requests in the "Pending Requests" queue.',
      icon: 'info',
      confirmButtonColor: '#3b82f6'
    });
  };

  const getStatusBadge = (status, dueDateStr) => {
    const s = status?.toLowerCase() || 'unknown';
    
    // Check overdue specifically if it's active
    if (s === 'active' && dueDateStr) {
      const today = new Date();
      const dueDate = new Date(dueDateStr);
      if (today > dueDate) {
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertCircle size={12}/> Overdue</span>;
      }
    }

    switch(s) {
      case 'active':
        return <span className="bg-blue-50 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'returned':
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">Returned</span>;
      case 'pending':
        return <span className="bg-orange-50 text-orange-700 border-orange-200 border px-2.5 py-1 rounded-full text-xs font-medium">Validation Pending</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 border px-2.5 py-1 rounded-full text-xs capitalize">{s}</span>;
    }
  };

  const isOverdue = (status, dueDateStr) => {
    if (status?.toLowerCase() === 'active' && dueDateStr) {
       return new Date() > new Date(dueDateStr);
    }
    return false;
  };

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrowing Management</h1>
          <p className="text-gray-500 mt-1">Track active checkouts, mark items returned, and manage overdue records.</p>
        </div>
        <button 
          onClick={handleIssueBookMock}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Issue New Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search transation ID, or patron..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-1/6">Trans ID</th>
                <th className="p-4 font-semibold w-1/4">Patron Details</th>
                <th className="p-4 font-semibold w-1/4 hidden md:table-cell">Book Title</th>
                <th className="p-4 font-semibold w-1/6">Dates</th>
                <th className="p-4 font-semibold w-1/6">Status / Fine</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading tracking history...</td></tr>
              ) : borrowings.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">No borrowing records found.</td></tr>
              ) : (
                borrowings.map((borrowing) => (
                  <tr key={borrowing.borrow_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 font-mono font-medium text-gray-900 border-r border-gray-50 bg-gray-50/20">
                      BW-{borrowing.borrow_id?.toString().padStart(4, '0')}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {borrowing.first_name || borrowing.username} {borrowing.last_name || ''}
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell font-medium">
                      {borrowing.title}
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 text-xs mb-0.5 whitespace-nowrap">
                        <span className="text-gray-400">Out:</span> {borrowing.checkout_date ? new Date(borrowing.checkout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Pending'}
                      </p>
                      <p className="text-gray-900 text-xs font-semibold whitespace-nowrap">
                        <span className="text-gray-400 font-normal">Due:</span> {borrowing.due_date ? new Date(borrowing.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Pending'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(borrowing.status, borrowing.due_date)}
                        {(borrowing.fine_amount > 0 || isOverdue(borrowing.status, borrowing.due_date)) && (
                          <span className="font-bold text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center justify-center">
                            ${borrowing.fine_amount > 0 ? Number(borrowing.fine_amount).toFixed(2) : '--'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        {borrowing.status !== 'returned' && (
                          <button onClick={() => handleReturnBook(borrowing.borrow_id)} className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Force Mark as Returned">
                            <CheckCircle size={18} />
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
        
        {/* Pagination */ }
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing {borrowings.length} records</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBorrowing;
