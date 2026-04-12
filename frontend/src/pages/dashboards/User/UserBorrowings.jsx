import React, { useState } from 'react';
import { Search, Download, BookOpen, Clock, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserBorrowings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Dummy data - will be replaced with API calls
  const borrowings = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'borrowed', dueDate: '2026-04-20', borrowDate: '2026-04-05', isDigital: true },
    { id: 2, title: '1984', author: 'George Orwell', status: 'returned', dueDate: '2026-03-15', borrowDate: '2026-03-01', returnedDate: '2026-03-14', isDigital: false },
    { id: 3, title: 'To Kill a Mockingbird', author: 'George Orwell', status: 'borrowed', dueDate: '2026-04-18', borrowDate: '2026-04-04', isDigital: true },
  ];

  const filtered = borrowings.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (activeTab === 'active' ? b.status === 'borrowed' : b.status === 'returned')
  );

  const handleDownload = (book) => {
    Swal.fire({
      title: 'Downloading...',
      text: `Preparing ${book.title} for download.`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Borrowings</h1>
          <p className="text-sm text-gray-500">Track your current reads and borrowing history.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 sm:flex-none px-4 py-2 ${activeTab === 'active' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-500'} rounded-md text-sm transition-all`}
            >
              Currently Reading
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-4 py-2 ${activeTab === 'history' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-500'} rounded-md text-sm transition-all`}
            >
              Past History
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No books found</p>
              <p className="text-sm">You have no {activeTab} books matching your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(book => (
                <div key={book.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-24 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center shadow-sm">
                    <BookOpen size={24} className="text-gray-400" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{book.author}</p>
                    
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                        <Calendar size={14} />
                        Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${activeTab === 'active' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                        <Clock size={14} />
                        {activeTab === 'active' ? `Due: ${new Date(book.dueDate).toLocaleDateString()}` : `Returned: ${new Date(book.returnedDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>

                  {book.isDigital && activeTab === 'active' && (
                    <button 
                      onClick={() => handleDownload(book)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors shrink-0"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
