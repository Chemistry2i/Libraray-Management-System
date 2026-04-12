import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2, Star, AlertTriangle } from 'lucide-react';

const AdminReviews = () => {
  // Dummy data for initial display
  const [reviews, setReviews] = useState([
    { id: 'REV-001', patron: 'John Doe', book: 'The Great Gatsby', rating: 5, comment: 'An absolute classic. The character development is phenomenal and the pacing is perfect.', date: 'Oct 15, 2023', status: 'Approved' },
    { id: 'REV-002', patron: 'Emily Chen', book: 'Clean Code', rating: 4, comment: 'Very informative but can be a bit dry in some chapters. Still a must-read for developers.', date: 'Oct 14, 2023', status: 'Pending' },
    { id: 'REV-003', patron: 'Michael Johnson', book: '1984', rating: 1, comment: 'This book has inappropriate content! Ban this immediately!!! [Spam Link]', date: 'Oct 16, 2023', status: 'Flagged' },
    { id: 'REV-004', patron: 'Sarah Smith', book: 'To Kill a Mockingbird', rating: 5, comment: 'One of the best books I have ever read. The library copy was in great condition too.', date: 'Oct 10, 2023', status: 'Approved' },
    { id: 'REV-005', patron: 'Robert Wilson', book: 'Sapiens', rating: 2, comment: 'Not what I expected. The author makes too many leaps of logic.', date: 'Oct 12, 2023', status: 'Pending' }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Approved</span>;
      case 'Pending':
        return <span className="bg-yellow-50 text-yellow-700 border-yellow-200 border px-2.5 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'Flagged':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> Flagged</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
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

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Moderation</h1>
          <p className="text-gray-500 mt-1">Review user feedback, moderate inappropriate comments, and approve ratings.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews by book or patron..." 
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-1/4">Book & Patron</th>
                <th className="p-4 font-semibold w-1/12">Rating</th>
                <th className="p-4 font-semibold w-2/5">Comment</th>
                <th className="p-4 font-semibold w-1/12 text-center">Status</th>
                <th className="p-4 font-semibold w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 truncate max-w-[200px] hover:text-primary transition-colors cursor-pointer">{review.book}</p>
                    <p className="text-gray-500 text-xs mt-0.5">by <span className="font-medium text-gray-700">{review.patron}</span></p>
                    <p className="text-gray-400 text-[10px] mt-1">{review.date}</p>
                  </td>
                  <td className="p-4">
                    {renderStars(review.rating)}
                  </td>
                  <td className="p-4">
                    <p className="text-gray-600 text-sm line-clamp-2" title={review.comment}>
                      {review.comment}
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(review.status)}
                    </div>
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Full Review">
                        <Eye size={18} />
                      </button>
                      
                      {review.status !== 'Approved' && (
                        <button className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      
                      {review.status !== 'Flagged' && (
                        <button className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Flag / Reject">
                          <AlertTriangle size={18} />
                        </button>
                      )}

                      <button className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Moderation">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing 1 to 5 of 84 reviews</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;