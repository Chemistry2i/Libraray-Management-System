import React, { useState, useEffect } from 'react';
import { Search, Star, Edit, Trash2, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';
import { reviewAPI } from '../../../api/endpoints';

export default function UserReviews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getUserReviews();
      console.log('User reviews response:', response.data);
      
      const data = response.data?.data?.items || response.data?.data?.reviews || response.data?.data || [];
      const formatted = Array.isArray(data) ? data.map(r => ({
        id: r.review_id,
        bookTitle: r.title || r.bookTitle,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at,
        bookId: r.book_id,
        reviewId: r.review_id
      })) : [];
      
      setReviews(formatted);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reviews',
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = reviews.filter(r => 
    (r.bookTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (review) => {
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });

    if (result.isConfirmed) {
      try {
        await reviewAPI.deleteReview(review.bookId, review.reviewId);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your review has been removed.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        
        fetchReviews();
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete review',
          timer: 3000,
        });
      }
    }
  };

  const handleEdit = async (review) => {
    const { value: newComment } = await Swal.fire({
      title: 'Edit Review',
      input: 'textarea',
      inputValue: review.comment,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Save Changes',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });

    if (newComment !== undefined) {
      try {
        await reviewAPI.updateReview(review.bookId, review.reviewId, {
          rating: review.rating,
          comment: newComment
        });
        
        Swal.fire({
          title: 'Updated!',
          text: 'Your review has been updated.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        
        fetchReviews();
      } catch (error) {
        console.error('Update error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to update review',
          timer: 3000,
        });
      }
    }
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
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
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
