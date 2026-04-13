import React, { useState } from 'react';
import { Search, Star, Edit, Trash2, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserReviews() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Data
  const reviews = [
    { id: 1, bookTitle: 'Clean Architecture', rating: 5, comment: 'Incredible book on software design. Highly recommended!', date: '2026-04-10' },
    { id: 2, title: 'The Pragmatic Programmer', rating: 4, comment: 'Great tips, though some are getting a bit dated.', date: '2026-03-15' },
  ];

  const filtered = reviews.filter(r => 
    (r.bookTitle || r.title).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (review) => {
    Swal.fire({
      title: 'Delete Review?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Your review has been removed.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
      }
    });
  };

  const handleEdit = (review) => {
    Swal.fire({
      title: 'Edit Review',
      input: 'textarea',
      inputValue: review.comment,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5', // primary color
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Save Changes',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Updated!',
          text: 'Your review has been updated.',
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
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500">Manage feedback you've left on books.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-end">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(review => (
                <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{review.bookTitle || review.title}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-500">
                    <span>Posted on {new Date(review.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
