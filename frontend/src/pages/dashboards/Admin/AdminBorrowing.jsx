import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Eye, AlertCircle, DollarSign, Plus } from 'lucide-react';

const AdminBorrowing = () => {
  // Dummy data for initial display
  const [borrowings, setBorrowings] = useState([
    { id: 'BW-1001', patron: 'John Doe', book: 'The Great Gatsby', checkoutDate: 'Oct 01, 2023', dueDate: 'Oct 15, 2023', status: 'Active', fine: 0 },
    { id: 'BW-1002', patron: 'Emily Chen', book: 'Clean Code', checkoutDate: 'Sep 25, 2023', dueDate: 'Oct 09, 2023', status: 'Overdue', fine: 4.50 },
    { id: 'BW-1003', patron: 'Michael Johnson', book: '1984', checkoutDate: 'Oct 10, 2023', dueDate: 'Oct 24, 2023', status: 'Active', fine: 0 },
    { id: 'BW-1004', patron: 'Sarah Smith', book: 'To Kill a Mockingbird', checkoutDate: 'Sep 10, 2023', dueDate: 'Sep 24, 2023', status: 'Returned', fine: 2.00 },
    { id: 'BW-1005', patron: 'Robert Wilson', book: 'Sapiens', checkoutDate: 'Sep 05, 2023', dueDate: 'Sep 19, 2023', status: 'Overdue', fine: 15.00 }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <span className="bg-blue-50 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'Overdue':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertCircle size={12}/> Overdue</span>;
      case 'Returned':
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">Returned</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 border px-2.5 py-1">{status}</span>;
    }
  };

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrowing Management</h1>
          <p className="text-gray-500 mt-1">Track active checkouts, mark items returned, and manage overdue records.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
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
              placeholder="Search by patron, book, or transaction ID..." 
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
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Patron Details</th>
                <th className="p-4 font-semibold hidden md:table-cell">Book Title</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Status / Fine</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {borrowings.map((borrowing) => (
                <tr key={borrowing.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-mono font-medium text-gray-900 border-r border-gray-50 bg-gray-50/20">{borrowing.id}</td>
                  <td className="p-4 font-bold text-gray-800">{borrowing.patron}</td>
                  <td className="p-4 text-gray-600 hidden md:table-cell font-medium">
                    {borrowing.book}
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900 text-xs mb-0.5"><span className="text-gray-400">Out:</span> {borrowing.checkoutDate}</p>
                    <p className="text-gray-900 text-xs font-semibold"><span className="text-gray-400 font-normal">Due:</span> {borrowing.dueDate}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(borrowing.status)}
                      {borrowing.fine > 0 && (
                        <span className="font-bold text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center justify-center">
                          ${borrowing.fine.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                      {borrowing.status !== 'Returned' && (
                        <button className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Mark as Returned">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {(borrowing.status === 'Overdue' || borrowing.status === 'Active') && (
                        <button className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Levy Fine">
                          <DollarSign size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBorrowing;