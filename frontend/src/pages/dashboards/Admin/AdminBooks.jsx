import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, MoreVertical, Eye, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';
import { filterBySearch } from '../../../utils/searchUtils';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBook, setViewBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category_id: '', publication_year: '', copies: 1, available: 1
  });
  const [files, setFiles] = useState({ cover: null, book_file: null });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/books?limit=100');
      setBooks(data?.data?.items || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories?limit=100');
      setCategories(data?.data?.items || []);
    } catch (err) {
      console.error('Failed to get categories');
    }
  };

  const handleAddClick = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', isbn: '', category_id: '', publication_year: '', copies: 1, available: 1 });
    setFiles({ cover: null, book_file: null });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setFormData({ 
      title: book.title || '', 
      author: book.author || '', 
      isbn: book.isbn || '', 
      category_id: book.category_id || '', 
      publication_year: book.publication_year || '',
      copies: book.total_copies || 1, 
      available: book.available_copies || 1
    });
    setFiles({ cover: null, book_file: null });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (bookId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This book will be removed from the inventory. You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/books/${bookId}`);
          setBooks(books.filter(b => b.book_id !== bookId));
          Swal.fire('Deleted!', 'The book has been successfully deleted.', 'success');
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Failed to delete book', 'error');
        }
      }
    });
  };

  const handleFileChange = (e, field) => {
    setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    if (files.cover) submitData.append('cover', files.cover);
    if (files.book_file) submitData.append('book_file', files.book_file);

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.book_id}`, formData); // The backend validator doesn't expect form-data files for PUT in current code, but let's check
        // Oh wait. The backend for PUT /:id doesn't parse form-data in BookController.updateBook!
        // Right, PUT expects JSON because upload.fields() isn't in router.put('/:id')
        // Let's just upload JSON for PUT.
        
        await api.put(`/books/${editingBook.book_id}`, formData);
        Swal.fire({ title: 'Updated!', text: 'Book details have been successfully updated.', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        if (!files.cover || !files.book_file) {
          setIsSaving(false);
          return Swal.fire('Warning', 'Both Cover Image and Book File are required for new books.', 'warning');
        }
        await api.post('/books', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({ title: 'Added!', text: 'New book has been successfully added to inventory.', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchBooks();
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

  // Client-side filtering
  const filteredBooks = filterBySearch(books, searchTerm, ['title', 'author', 'isbn']);

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books & Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your library's catalog, add new books, and track inventory.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Title & Author</th>
                <th className="p-4 font-semibold hidden md:table-cell">ISBN</th>
                <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="p-4 font-semibold text-center">Inventory</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading books...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">No books found.</td></tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.book_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gray-200 rounded object-cover flex-shrink-0 border border-gray-300 overflow-hidden">
                          {book.cover_url ? (
                            <img src={`http://localhost:5000${book.cover_url}`} alt="cover" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{book.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs hidden md:table-cell">{book.isbn || 'N/A'}</td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                        {book.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-gray-900 font-medium">{book.available_copies || 0} <span className="text-gray-400 font-normal">/ {book.total_copies || 0}</span></p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${(book.available_copies || 0) > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {(book.available_copies || 0) > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => setViewBook(book)} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEditClick(book)} className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(book.book_id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
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
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 font-medium text-sm text-gray-500">
          <p>Showing {filteredBooks.length} books</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {viewBook && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 sticky top-0 bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
              <button onClick={() => setViewBook(null)} className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Book Cover Section */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-200 aspect-[3/4] flex items-center justify-center">
                    {viewBook.cover_url ? (
                      <img src={`http://localhost:5000${viewBook.cover_url}`} alt={viewBook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Eye size={48} />
                        <p className="text-sm mt-2 text-center">No cover image</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 w-full">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${(viewBook.available_copies || 0) > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {(viewBook.available_copies || 0) > 0 ? '✓ Available' : '✗ Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Book Information Section */}
                <div className="md:col-span-2 space-y-6">
                  {/* Title */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</p>
                    <p className="text-3xl font-bold text-gray-900">{viewBook.title}</p>
                  </div>

                  {/* Author */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Author</p>
                    <p className="text-lg text-gray-700">{viewBook.author}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20">
                      {viewBook.category_name || 'Uncategorized'}
                    </span>
                  </div>

                  {/* ISBN & Publication Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ISBN</p>
                      <p className="text-gray-700 font-mono text-sm">{viewBook.isbn || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Published</p>
                      <p className="text-gray-700 text-sm">{viewBook.publication_year || 'Unknown'}</p>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Copies</p>
                      <p className="text-2xl font-bold text-gray-900">{viewBook.total_copies || 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Available</p>
                      <p className="text-2xl font-bold text-blue-700">{viewBook.available_copies || 0}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Borrowed</p>
                      <p className="text-2xl font-bold text-orange-700">{(viewBook.total_copies || 0) - (viewBook.available_copies || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                <button onClick={() => setViewBook(null)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Close
                </button>
                <button onClick={() => { setViewBook(null); handleEditClick(viewBook); }} className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
                  <Edit size={18} />
                  Edit Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[4px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex gap-4">
                  {!editingBook && (
                    <>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image *</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'cover')}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">E-Book File (PDF/EPUB) *</label>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileChange(e, 'book_file')}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input type="text" placeholder="e.g. The Great Gatsby" required value={formData.title} onChange={(e) => {setFormData({...formData, title: e.target.value}); setFormErrors({...formErrors, title: null});}} className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.title ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
                  <input type="text" placeholder="e.g. F. Scott Fitzgerald" required value={formData.author} onChange={(e) => {setFormData({...formData, author: e.target.value}); setFormErrors({...formErrors, author: null});}} className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.author ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} />
                  {formErrors.author && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.author}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN</label>
                  <input type="text" placeholder="e.g. 978-0743273565" value={formData.isbn} onChange={(e) => {setFormData({...formData, isbn: e.target.value}); setFormErrors({...formErrors, isbn: null});}} className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.isbn ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} />
                  {formErrors.isbn && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.isbn}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select required value={formData.category_id} onChange={(e) => {setFormData({...formData, category_id: e.target.value}); setFormErrors({...formErrors, category_id: null});}} className={`w-full p-2.5 border rounded-lg text-sm outline-none bg-white transition-all ${formErrors.category_id ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`}>
                    <option value="">Select category...</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                  {formErrors.category_id && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.category_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Publication Year</label>
                  <input type="number" placeholder="e.g. 1925" value={formData.publication_year} onChange={(e) => {setFormData({...formData, publication_year: e.target.value}); setFormErrors({...formErrors, publication_year: null});}} className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.publication_year ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} />
                  {formErrors.publication_year && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.publication_year}</p>}
                </div>
                {!editingBook && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Total Copies</label>
                      <input type="number" min="1" placeholder="e.g. 5" required value={formData.copies} onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value)})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Available Copies</label>
                      <input type="number" min="0" placeholder="e.g. 5" required value={formData.available} onChange={(e) => setFormData({...formData, available: parseInt(e.target.value)})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </>
                )}
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
                    editingBook ? 'Save Changes' : 'Save Book'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
