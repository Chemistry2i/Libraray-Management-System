import React, { useState } from 'react';
import { Search, Bookmark, Clock, XCircle, Bell } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserReservations() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Data
  const reservations = [
    { id: 1, title: 'Clean Architecture', author: 'Robert C. Martin', queuePosition: 2, estimatedDate: '2026-04-20', status: 'waiting' },
    { id: 2, title: 'The Pragmatic Programmer', author: 'Robert C. Martin', queuePosition: 1, estimatedDate: '2026-04-14', status: 'available' },
  ];

  const filtered = reservations.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = (book) => {
    Swal.fire({
      title: 'Cancel Reservation?',
      text: `Are you sure you want to cancel your spot for "${book.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, cancel it',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cancelled',
          text: 'Your reservation has been removed.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-sm text-gray-500">Track books you are waiting to borrow.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-end">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reservations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <Bookmark size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No reservations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(res => (
                <div key={res.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-24 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center shadow-sm">
                    <Bookmark size={24} className={res.status === 'available' ? 'text-green-500' : 'text-gray-400'} />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{res.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{res.author}</p>
                    
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-md">
                        Queue Position: #{res.queuePosition}
                      </div>
                      {res.status === 'available' ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                          <Bell size={14} />
                          Ready for pickup!
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                          <Clock size={14} />
                          Est. Available: {new Date(res.estimatedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCancel(res)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors shrink-0"
                  >
                    <XCircle size={16} />
                    Cancel Hold
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
