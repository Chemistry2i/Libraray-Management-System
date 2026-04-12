import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Eye, ShieldOff, DollarSign } from 'lucide-react';

const AdminFines = () => {
  const [fines, setFines] = useState([
    { id: 'FIN-001', patron: 'Emily Chen', amount: 4.50, reason: 'Overdue: Clean Code', dateIssued: 'Oct 09, 2023', status: 'Unpaid' },
    { id: 'FIN-002', patron: 'Robert Wilson', amount: 15.00, reason: 'Overdue: Sapiens', dateIssued: 'Sep 19, 2023', status: 'Unpaid' },
    { id: 'FIN-003', patron: 'Sarah Smith', amount: 2.00, reason: 'Overdue: To Kill a Mockingbird', dateIssued: 'Sep 24, 2023', status: 'Paid' },
    { id: 'FIN-004', patron: 'Michael Johnson', amount: 25.50, reason: 'Lost Book: 1984', dateIssued: 'Oct 16, 2023', status: 'Unpaid' },
    { id: 'FIN-005', patron: 'John Doe', amount: 1.50, reason: 'Overdue: The Great Gatsby', dateIssued: 'Oct 12, 2023', status: 'Waived' }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Paid</span>;
      case 'Unpaid':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium">Unpaid</span>;
      case 'Waived':
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">Waived</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

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
            <p className="text-lg font-bold text-gray-900">$45.00</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by patron or fine ID..." 
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
                <th className="p-4 font-semibold">Fine ID & Date</th>
                <th className="p-4 font-semibold">Patron Details</th>
                <th className="p-4 font-semibold w-1/3">Reason</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {fines.map((fine) => (
                <tr key={fine.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 w-max">{fine.id}</p>
                    <p className="text-gray-500 text-xs mt-1">{fine.dateIssued}</p>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{fine.patron}</td>
                  <td className="p-4 text-gray-600 text-sm">{fine.reason}</td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-gray-900">${fine.amount.toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(fine.status)}
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                        <Eye size={18} />
                      </button>
                      {fine.status === 'Unpaid' && (
                        <>
                          <button className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Mark as Paid">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Waive Fine">
                            <ShieldOff size={18} />
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

export default AdminFines;