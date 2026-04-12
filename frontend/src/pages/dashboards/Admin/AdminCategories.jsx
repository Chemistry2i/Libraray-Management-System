import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const AdminCategories = () => {
  // Dummy data for initial display
  const [categories, setCategories] = useState([
    { id: 1, name: 'Fiction', description: 'Fictional literature, novels, and stories.', bookCount: 124 },
    { id: 2, name: 'Non-Fiction', description: 'Informative and factual books across various topics.', bookCount: 86 },
    { id: 3, name: 'Science & Technology', description: 'Computer science, engineering, physics, and general science.', bookCount: 245 },
    { id: 4, name: 'History', description: 'Historical events, eras, and biographies.', bookCount: 52 },
    { id: 5, name: 'Children', description: 'Books aimed at younger readers and toddlers.', bookCount: 67 }
  ]);

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Genres</h1>
          <p className="text-gray-500 mt-1">Manage book categories to help patrons efficiently find what they need.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-1/4">Category Name</th>
                <th className="p-4 font-semibold w-1/2">Description</th>
                <th className="p-4 font-semibold text-center w-1/6">Total Books</th>
                <th className="p-4 font-semibold text-right w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{category.name}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {category.description}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                      {category.bookCount}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing 1 to 5 of 12 categories</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
