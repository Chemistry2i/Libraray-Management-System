import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';

const AdminBooks = () => {
  // Dummy data for initial display
  const [books, setBooks] = useState([
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction', copies: 5, available: 3, status: 'Available' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0060935467', category: 'Fiction', copies: 3, available: 0, status: 'Out of Stock' },
    { id: 3, title: '1984', author: 'Harper Lee', isbn: '978-0446310789', category: 'Fiction', copies: 4, available: 4, status: 'Available' },
    { id: 4, title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Technology', copies: 2, available: 1, status: 'Available' },
    { id: 5, title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0062316097', category: 'History', copies: 6, available: 2, status: 'Available' }
  ]);

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books & Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your library's catalog, add new books, and track inventory.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Add New Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
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
                <th className="p-4 font-semibold">Title & Author</th>
                <th className="p-4 font-semibold">ISBN</th>
                <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="p-4 font-semibold text-center">Inventory</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-gray-200 rounded object-cover flex-shrink-0 border border-gray-300"></div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{book.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-xs">{book.isbn}</td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                      {book.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <p className="text-gray-900 font-medium">{book.available} <span className="text-gray-400 font-normal">/ {book.copies}</span></p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      book.available > 0 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {book.available > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors sm:hidden">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing 1 to 5 of 45 books</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBooks;