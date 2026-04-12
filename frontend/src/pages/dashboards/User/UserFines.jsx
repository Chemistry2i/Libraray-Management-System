import React, { useState } from 'react';
import { Search, Wallet, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserFines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('unpaid');

  // Dummy Data
  const fines = [
    { id: 1, reason: 'Overdue: The Great Gatsby', amount: 5.50, issueDate: '2026-04-10', status: 'unpaid' },
    { id: 2, reason: 'Overdue: 1984', amount: 2.00, issueDate: '2026-03-20', paidDate: '2026-03-25', status: 'paid' },
  ];

  const filtered = fines.filter(f => 
    f.reason.toLowerCase().includes(searchTerm.toLowerCase()) && f.status === activeTab
  );

  const totalUnpaid = fines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

  const handlePay = (fine) => {
    Swal.fire({
      title: 'Pay Fine?',
      text: `You will be redirected to the secure payment portal for $${fine.amount.toFixed(2)}.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Proceed to Payment',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Payment Successful',
          text: 'Thank you. Your account is clear.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[4px] z-[9999]' }
        });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fines & Payments</h1>
          <p className="text-sm text-gray-500">Manage your library account balance.</p>
        </div>
      </div>

      {totalUnpaid > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <AlertCircle size={28} />
            </div>
            <div>
              <h4 className="font-bold text-red-900">Outstanding Balance: ${totalUnpaid.toFixed(2)}</h4>
              <p className="text-red-700 text-sm mt-1">Please pay your fines soon to avoid borrowing restrictions.</p>
            </div>
          </div>
          <button 
            onClick={() => handlePay({ amount: totalUnpaid })}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-all shrink-0"
          >
            <CreditCard size={18} />
            Pay All Now
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('unpaid')}
              className={`flex-1 sm:flex-none px-4 py-2 ${activeTab === 'unpaid' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-500'} rounded-md text-sm transition-all`}
            >
              Unpaid
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`flex-1 sm:flex-none px-4 py-2 ${activeTab === 'paid' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-500'} rounded-md text-sm transition-all`}
            >
              Paid
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search fines..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <Wallet size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No {activeTab} fines found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(fine => (
                <div key={fine.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    {fine.status === 'paid' ? <CheckCircle size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-red-500" />}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{fine.reason}</h3>
                    <p className="text-sm text-gray-500 mt-1">Issued: {new Date(fine.issueDate).toLocaleDateString()}</p>
                    {fine.status === 'paid' && <p className="text-sm text-green-600 mt-1">Paid on: {new Date(fine.paidDate).toLocaleDateString()}</p>}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${fine.status === 'unpaid' ? 'text-red-600' : 'text-gray-900'}`}>
                      ${fine.amount.toFixed(2)}
                    </span>
                    {fine.status === 'unpaid' && (
                      <button 
                        onClick={() => handlePay(fine)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors shrink-0"
                      >
                        Pay
                      </button>
                    )}
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
