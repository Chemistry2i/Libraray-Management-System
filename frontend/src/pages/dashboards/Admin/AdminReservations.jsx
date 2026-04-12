import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

const AdminReservations = () => {
  // Dummy data for initial display
  const [reservations, setReservations] = useState([
    { id: 'RES-001', patron: 'John Doe', book: 'The Great Gatsby', requestDate: 'Oct 12, 2023', status: 'Pending', queuePosition: 1 },
    { id: 'RES-002', patron: 'Emily Chen', book: 'Clean Code', requestDate: 'Oct 14, 2023', status: 'Approved', queuePosition: 0 },
    { id: 'RES-003', patron: 'Michael Johnson', book: '1984', requestDate: 'Oct 15, 2023', status: 'Pending', queuePosition: 3 },
    { id: 'RES-004', patron: 'Sarah Smith', book: 'To Kill a Mockingbird', requestDate: 'Oct 10, 2023', status: 'Fulfilled', queuePosition: 0 },
    { id: 'RES-005', patron: 'Robert Wilson', book: 'Sapiens', requestDate: 'Oct 16, 2023', status: 'Cancelled', queuePosition: 0 }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="bg-blue-50 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-full text-xs font-medium">Approved</span>;
      case 'Pending':
        return <span className="bg-yellow-50 text-yellow-700 border-yellow-200 border px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle size={12}/> Pending</span>;
      case 'Fulfilled':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Fulfilled</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holds & Reservations</h1>
          <p className="text-gray-500 mt-1">Manage book hold requests and waitlist queues.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by patron, book, or ID..." 
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
                <th className="p-4 font-semibold">ID & Date</th>
                <th className="p-4 font-semibold">Patron</th>
                <th className="p-4 font-semibold hidden md:table-cell">Book Requested</th>
                <th className="p-4 font-semibold text-center">Queue Position</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{res.id}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{res.requestDate}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{res.patron}</td>
                  <td className="p-4 text-gray-600 hidden md:table-cell font-medium">
                    {res.book}
                  </td>
                  <td className="p-4 text-center">
                    {res.queuePosition > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                        {res.queuePosition}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(res.status)}
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                        <Eye size={18} />
                      </button>
                      {res.status === 'Pending' && (
                        <>
                          <button className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve Request">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Cancel Request">
                            <XCircle size={18} />
                          </button>
                        </>
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

export default AdminReservations;