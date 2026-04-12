import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories?limit=100');
      setCategories(data?.data?.items || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setFormData({ category_name: '', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({ 
      category_name: category.category_name || '', 
      description: category.description || '' 
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This category will be permanently removed. You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/categories/${categoryId}`);
          setCategories(categories.filter(c => c.category_id !== categoryId));
          Swal.fire('Deleted!', 'The category has been successfully deleted.', 'success');
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Failed to delete category', 'error');
        }
      }
    });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.category_id}`, formData);
        Swal.fire({ title: 'Updated!', text: 'Category details have been successfully updated.', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/categories', formData);
        Swal.fire({ title: 'Added!', text: 'New category has been successfully added.', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        const errorsMap = {};
        error.response.data.errors.forEach(err => {
          errorsMap[err.path || err.param] = err.msg;
        });
        setFormErrors(errorsMap);
      } else {
        Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  
  const filteredCategories = categories.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Genres</h1>
          <p className="text-gray-500 mt-1">Manage book categories to help patrons efficiently find what they need.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {loading ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">No categories found.</td></tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.category_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{category.category_name}</p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {category.description || 'No description provided.'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100 min-w-[30px]">
                        {category.bookCount || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => setViewItem(category)} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEditClick(category)} className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(category.category_id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
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

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing {categories.length} categories</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[4px] shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto w-full">
                <form onSubmit={handleSaveModal} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Science Fiction" 
                        required 
                        value={formData.category_name} 
                        onChange={(e) => {setFormData({...formData, category_name: e.target.value}); setFormErrors({...formErrors, category_name: null});}} 
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.category_name ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                      />
                      {formErrors.category_name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.category_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea 
                        rows="4"
                        placeholder="Describe the genre or category..." 
                        value={formData.description} 
                        onChange={(e) => {setFormData({...formData, description: e.target.value}); setFormErrors({...formErrors, description: null});}} 
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.description ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                      />
                      {formErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.description}</p>}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50" disabled={isSaving}>
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isSaving}>
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        editingCategory ? 'Save Changes' : 'Save Category'
                      )}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}
    
      {/* View Category Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-airbnb-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Category Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Category Name</p>
                 <p className="text-gray-900 text-lg font-semibold">{viewItem.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Description</p>
                 <p className="text-gray-700">{viewItem.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button type="button" onClick={() => setViewItem(null)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* View Category Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-airbnb-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Category Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Category Name</p>
                 <p className="text-gray-900 text-lg font-semibold">{viewItem.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <p className="text-sm text-gray-500 font-bold mb-1">Description</p>
                 <p className="text-gray-700">{viewItem.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button type="button" onClick={() => setViewItem(null)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCategories;


