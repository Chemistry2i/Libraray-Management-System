import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Eye, AlertCircle, DollarSign, Plus, ThumbsUp } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';

const AdminBorrowing = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      console.log('Fetching borrowings from /borrowing/admin/all...');
      const response = await api.get('/borrowing/admin/all?limit=100');
      console.log('Borrowing response:', response.data);
      
      // Extract items from paginated response
      const items = response.data?.data?.items || response.data?.data || [];
      console.log('Extracted borrowing items:', items);
      
      setBorrowings(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to fetch borrowing records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = (borrowing) => {
    const patronName = `${borrowing.first_name || borrowing.username} ${borrowing.last_name || ''}`;
    const checkoutDate = new Date(borrowing.checkout_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const dueDate = new Date(borrowing.due_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const isOverdue = new Date() > new Date(borrowing.due_date);
    const daysOverdue = isOverdue ? Math.ceil((new Date() - new Date(borrowing.due_date)) / (1000 * 60 * 60 * 24)) : 0;
    
    Swal.fire({
      title: '📖 Mark Book as Returned',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 class="font-bold text-gray-900 mb-3">Return Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Patron:</span>
                <span class="font-semibold text-gray-900">${patronName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Book Title:</span>
                <span class="font-semibold text-gray-900">${borrowing.title}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Checkout Date:</span>
                <span class="text-gray-700">${checkoutDate}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Due Date:</span>
                <span class="font-semibold ${isOverdue ? 'text-red-600' : 'text-green-600'}">${dueDate}</span>
              </div>
            </div>
          </div>
          
          ${isOverdue ? `
            <div class="bg-red-50 border border-red-200 p-3 rounded">
              <p class="text-red-900 text-sm">
                <strong>⚠ OVERDUE:</strong> This book is <strong>${daysOverdue} days late</strong>
                ${borrowing.fine_amount > 0 ? `<br/>A fine of <strong>$${Number(borrowing.fine_amount).toFixed(2)}</strong> has been calculated.` : ''}
              </p>
            </div>
          ` : `
            <div class="bg-green-50 border border-green-200 p-3 rounded">
              <p class="text-green-900 text-sm">
                <strong>✓</strong> Book returned on time!
              </p>
            </div>
          `}
          
          <p class="text-gray-600 text-sm">Confirm that the book has been returned?</p>
        </div>
      `,
      icon: isOverdue ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      cancelButtonText: 'Cancel',
      confirmButtonText: '✓ Mark Returned',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg mr-2 transition-colors',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('Returning book with borrow ID:', borrowing.borrow_id);
          
          Swal.fire({
            title: 'Processing...',
            text: 'Processing the return...',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: async () => {
              Swal.showLoading();
            }
          });
          
          const res = await api.post(`/borrowing/admin/return/${borrowing.borrow_id}`);
          console.log('Return response:', res.data);
          
          const fine = res.data?.data?.fine || borrowing.fine_amount || 0;
          
          if (fine > 0) {
            Swal.fire({
              title: '⚠ Returned with Fine',
              html: `
                <div class="text-left">
                  <p class="mb-4 text-gray-700">
                    Book has been marked as returned.
                  </p>
                  <div class="bg-red-50 border border-red-200 p-3 rounded">
                    <p class="text-red-900 text-sm">
                      <strong>Fine Amount:</strong> $${Number(fine).toFixed(2)}<br/>
                      <span class="text-xs">For late return of the book</span>
                    </p>
                  </div>
                </div>
              `,
              icon: 'warning',
              confirmButtonColor: '#f59e0b',
              confirmButtonText: 'Done'
            });
          } else {
            Swal.fire({
              title: '✅ Returned Successfully!',
              html: `
                <p class="text-gray-700">
                  The book has been marked as returned for <strong>${patronName}</strong>. No fines applicable.
                </p>
              `,
              icon: 'success',
              confirmButtonColor: '#10b981',
              confirmButtonText: 'Done'
            });
          }
          
          fetchBorrowings();
        } catch (error) {
          console.error('Error returning book:', error);
          Swal.fire({
            title: '❌ Error',
            text: error.response?.data?.message || 'Failed to return book',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
  };

  const handleApproveBorrow = (borrowing) => {
    const patronName = `${borrowing.first_name || borrowing.username} ${borrowing.last_name || ''}`;
    const dueDate = new Date(borrowing.due_date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    Swal.fire({
      title: '✅ Approve Borrowing Request',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 class="font-bold text-gray-900 mb-3">Request Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Patron:</span>
                <span class="font-semibold text-gray-900">${patronName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Book Title:</span>
                <span class="font-semibold text-gray-900">${borrowing.title}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Due Date:</span>
                <span class="font-semibold text-blue-600">${dueDate}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Request Date:</span>
                <span class="text-gray-700">${new Date(borrowing.checkout_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-green-50 border border-green-200 p-3 rounded text-sm">
            <p class="text-green-900">
              <strong>✓</strong> Once approved, the patron can collect their book immediately.
            </p>
          </div>
          
          <p class="text-gray-600 text-sm mt-4">Are you sure you want to approve this request?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      cancelButtonText: 'Cancel',
      confirmButtonText: '✓ Approve Request',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg mr-2 transition-colors',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('Approving borrow request with ID:', borrowing.borrow_id);
          
          Swal.fire({
            title: 'Processing...',
            text: 'Approving the request...',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: async () => {
              Swal.showLoading();
            }
          });
          
          const res = await api.post(`/borrowing/${borrowing.borrow_id}/approve`);
          console.log('Approve response:', res.data);
          
          Swal.fire({
            title: '✅ Approved Successfully!',
            html: `
              <div class="text-left">
                <p class="mb-4 text-gray-700">
                  <strong>${patronName}</strong> has been approved to borrow <strong>"${borrowing.title}"</strong>
                </p>
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                  <p class="text-sm text-blue-900">
                    <strong>Next Step:</strong> The patron can now collect the book from the library.
                  </p>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Done'
          });
          
          fetchBorrowings();
        } catch (error) {
          console.error('Error approving borrow request:', error);
          Swal.fire({
            title: '❌ Error',
            text: error.response?.data?.message || 'Failed to approve borrowing request',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
  };

  const handleRejectBorrow = (borrowing) => {
    const patronName = `${borrowing.first_name || borrowing.username} ${borrowing.last_name || ''}`;
    
    Swal.fire({
      title: '❌ Reject Borrowing Request',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 class="font-bold text-gray-900 mb-3">Request Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Patron:</span>
                <span class="font-semibold text-gray-900">${patronName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Book Title:</span>
                <span class="font-semibold text-gray-900">${borrowing.title}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason (Optional):</label>
            <textarea 
              id="rejectReason" 
              class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
              rows="4" 
              placeholder="Explain why you're rejecting this request...&#10;e.g., Book not available, Patron account has outstanding fines, etc."
            ></textarea>
          </div>
          
          <div class="bg-red-50 border border-red-200 p-3 rounded text-sm">
            <p class="text-red-900">
              <strong>⚠</strong> The patron will be notified of this rejection.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      cancelButtonText: 'Cancel',
      confirmButtonText: '✕ Reject Request',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg mr-2 transition-colors',
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors'
      },
      didOpen: () => {
        document.getElementById('rejectReason')?.focus();
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const reason = document.getElementById('rejectReason')?.value || '';
          console.log('Rejecting borrow request with ID:', borrowing.borrow_id, 'Reason:', reason);
          
          Swal.fire({
            title: 'Processing...',
            text: 'Rejecting the request...',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: async () => {
              Swal.showLoading();
            }
          });
          
          const res = await api.post(`/borrowing/${borrowing.borrow_id}/reject`, {
            rejection_reason: reason
          });
          console.log('Reject response:', res.data);
          
          Swal.fire({
            title: '✓ Rejected',
            html: `
              <div class="text-left">
                <p class="mb-4 text-gray-700">
                  <strong>${patronName}</strong>'s request for <strong>"${borrowing.title}"</strong> has been rejected.
                </p>
                ${reason ? `
                  <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                    <p class="text-gray-600">
                      <strong>Reason sent to patron:</strong><br/>
                      <span class="text-gray-700 italic mt-1 block">"${reason}"</span>
                    </p>
                  </div>
                ` : ''}
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#6b7280',
            confirmButtonText: 'Done'
          });
          
          fetchBorrowings();
        } catch (error) {
          console.error('Error rejecting borrow request:', error);
          Swal.fire({
            title: '❌ Error',
            text: error.response?.data?.message || 'Failed to reject borrowing request',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
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
      case 'pending_approval':
        return <span className="bg-orange-50 text-orange-700 border-orange-200 border px-2.5 py-1 rounded-full text-xs font-medium">⏳ Pending Approval</span>;
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
              placeholder="Search transaction ID or patron..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading borrowing records...</td></tr>
              ) : borrowings.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">No borrowing records found.</td></tr>
              ) : (
                borrowings.filter(b => {
                  const searchLower = searchTerm.toLowerCase();
                  const transId = `BW-${b.borrow_id?.toString().padStart(4, '0')}`.toLowerCase();
                  const patronName = `${b.first_name || b.username || ''} ${b.last_name || ''}`.toLowerCase();
                  return transId.includes(searchLower) || patronName.includes(searchLower);
                }).map((borrowing) => (
                  <tr key={borrowing.borrow_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 font-mono font-medium text-gray-900 border-r border-gray-50 bg-gray-50/20">
                      BW-{borrowing.borrow_id?.toString().padStart(4, '0')}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {borrowing.first_name || borrowing.username} {borrowing.last_name || ''}
                      <p className="text-xs text-gray-500 font-normal">{borrowing.email}</p>
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
                        
                        {/* Show approve/reject for pending requests */}
                        {(borrowing.status?.toLowerCase() === 'pending' || borrowing.status?.toLowerCase() === 'pending_approval') && (
                          <>
                            <button 
                              onClick={() => handleApproveBorrow(borrowing)}
                              className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                              title="Approve Request"
                            >
                              <ThumbsUp size={18} />
                            </button>
                            <button 
                              onClick={() => handleRejectBorrow(borrowing)}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                              title="Reject Request"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        {/* Show return button for active loans */}
                        {borrowing.status?.toLowerCase() === 'active' && (
                          <button 
                            onClick={() => handleReturnBook(borrowing)} 
                            className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                            title="Mark as Returned"
                          >
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
