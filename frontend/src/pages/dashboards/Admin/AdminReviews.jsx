import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Star, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // We use a dummy book ID of 0 since the admin/all route doesn't filter by book ID in the backend
      const res = await api.get('/books/0/reviews/admin/all', { params: { limit: 100 } });
      setReviews(res.data?.data?.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reviews data',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Review?',
        text: "This comment will be permanently removed. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Yes, delete it',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });

      if (result.isConfirmed) {
        await api.delete(`/books/0/reviews/admin/${reviewId}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'The review has been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
        fetchReviews();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete review',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.title?.toLowerCase().includes(term) ||
      r.username?.toLowerCase().includes(term) ||
      r.comment?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Moderation</h1>
          <p className="text-gray-500 mt-1">Review user feedback, moderate inappropriate comments, and delete reviews.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews by book, patron, or comment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-[4px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="mt-4 text-sm font-medium text-gray-600">Loading reviews...</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-1/4">Book & Patron</th>
                <th className="p-4 font-semibold w-1/12">Rating</th>
                <th className="p-4 font-semibold w-2/5">Comment</th>
                <th className="p-4 font-semibold w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredReviews.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 truncate max-w-[200px] hover:text-primary transition-colors cursor-pointer" title={review.title}>
                        {review.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">by <span className="font-medium text-gray-700">{review.username}</span></p>
                      <p className="text-gray-400 text-[10px] mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="p-4">
                      <p className="text-gray-600 text-sm max-w-sm whitespace-pre-wrap break-words" title={review.comment}>
                        {review.comment || <span className="text-gray-400 italic">No comment provided</span>}
                      </p>
                      {review.helpful_count > 0 && (
                        <p className="text-xs text-emerald-600 mt-1 font-medium">{review.helpful_count} people found this helpful</p>
                      )}
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button 
                          onClick={() => handleDeleteReview(review.review_id)}
                          className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Moderation">
                          <Trash2 size={18} />
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

export default AdminReviews;
