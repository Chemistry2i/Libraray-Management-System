import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Eye, Shield, UserX, User, Mail, Phone, Calendar, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    role: 'member', 
    status: 'active',
    phone_number: '',
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users?limit=100');
      setUsers(data?.data?.items || data?.data?.users || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'unknown';
    switch(s) {
      case 'active':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'suspended':
      case 'inactive':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium">Suspended</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium capitalize">{s}</span>;
    }
  };

  const getRoleBadge = (role) => {
    const r = role?.toLowerCase() || 'member';
    switch(r) {
      case 'admin':
        return <span className="text-purple-700 bg-purple-50 font-semibold px-2 py-0.5 rounded text-xs border border-purple-100 flex items-center gap-1 w-max"><Shield size={12} /> Admin</span>;
      case 'librarian':
      case 'staff':
        return <span className="text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.5 rounded text-xs border border-indigo-100 w-max">Librarian</span>;
      default:
        return <span className="text-gray-600 font-medium px-2 py-0.5 text-xs w-max border border-gray-200 rounded">Member</span>;
    }
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({ 
      first_name: '', last_name: '', email: '', role: 'member', status: 'active', phone_number: '', username: '', password: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ 
      first_name: user.first_name || '', 
      last_name: user.last_name || '', 
      email: user.email || '', 
      role: user.role || 'member', 
      status: user.status || 'active',
      phone_number: user.phone || user.phone_number || '',
      username: user.username || '',
      password: '' // don't load password on edit
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (userId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This user profile will be permanently deleted. You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${userId}`);
          setUsers(users.filter(u => u.user_id !== userId));
          Swal.fire('Deleted!', 'The user has been successfully deleted.', 'success');
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Failed to delete user', 'error');
        }
      }
    });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.user_id}`, formData);
        Swal.fire({ title: 'Updated!', text: 'User details have been successfully updated.', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/users', formData);
        Swal.fire({ title: 'Created!', text: 'New user profile created successfully.', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchUsers();
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

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patrons & Users</h1>
          <p className="text-gray-500 mt-1">Manage library members, staff roles, and user account statuses.</p>
        </div>
        <button 
          onClick={handleAddClick} 
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or user ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-1/4">User Info</th>
                <th className="p-4 font-semibold w-1/6">Role</th>
                <th className="p-4 font-semibold w-1/6">Status</th>
                <th className="p-4 font-semibold w-1/6">Join Date</th>
                <th className="p-4 font-semibold text-right w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"/>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200 shadow-sm shrink-0">
                            {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                          <p className="text-gray-500 text-xs truncate flex items-center gap-1 mt-0.5">
                            <Mail size={10}/> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4 text-gray-600 flex items-center gap-1.5 mt-2">
                       <Calendar size={14} className="text-gray-400"/>
                       {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                    </td>
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View Profile">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEditClick(user)} className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit User">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(user.user_id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete User">
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
          <p>Showing {users.length} users</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[4px] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User size={22} className="text-primary"/>
                {editingUser ? 'Edit User Profile' : 'Add New User'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto w-full">
                <form onSubmit={handleSaveModal} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                      <input 
                        type="text" 
                        placeholder="John" 
                        required 
                        value={formData.first_name} 
                        onChange={(e) => {setFormData({...formData, first_name: e.target.value}); setFormErrors({...formErrors, first_name: null});}} 
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.first_name ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                      />
                      {formErrors.first_name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.first_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                      <input 
                        type="text" 
                        placeholder="Doe" 
                        required 
                        value={formData.last_name} 
                        onChange={(e) => {setFormData({...formData, last_name: e.target.value}); setFormErrors({...formErrors, last_name: null});}} 
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.last_name ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                      />
                      {formErrors.last_name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.last_name}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                      <div className="relative">
                         <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input 
                           type="email" 
                           placeholder="john.doe@example.com" 
                           required 
                           value={formData.email} 
                           onChange={(e) => {setFormData({...formData, email: e.target.value}); setFormErrors({...formErrors, email: null});}} 
                           className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.email ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                         />
                      </div>
                      {formErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Username (Optional)</label>
                      <div className="relative">
                         <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input 
                           type="text" 
                           placeholder="johndoe88" 
                           value={formData.username} 
                           onChange={(e) => {setFormData({...formData, username: e.target.value}); setFormErrors({...formErrors, username: null});}} 
                           className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.username ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                         />
                      </div>
                      {formErrors.username && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.username}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                         <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input 
                           type="text" 
                           placeholder="+1 (555) 000-0000" 
                           value={formData.phone_number} 
                           onChange={(e) => {setFormData({...formData, phone_number: e.target.value}); setFormErrors({...formErrors, phone_number: null});}} 
                           className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.phone_number ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                         />
                      </div>
                      {formErrors.phone_number && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.phone_number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {editingUser ? 'Reset Password (leave blank to keep current)' : 'Password *'}
                      </label>
                      <input 
                        type="password" 
                        placeholder={editingUser ? "••••••••" : "Secure password"} 
                        required={!editingUser}
                        value={formData.password} 
                        onChange={(e) => {setFormData({...formData, password: e.target.value}); setFormErrors({...formErrors, password: null});}} 
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all ${formErrors.password ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-primary/20'}`} 
                      />
                      {formErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.password}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">System Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                      >
                        <option value="member">Library Member</option>
                        <option value="librarian">Librarian / Staff</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Account Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                      >
                        <option value="active">Active - Permitted to borrow</option>
                        <option value="suspended">Suspended - Temporarily blocked</option>
                        <option value="inactive">Inactive - Closed account</option>
                      </select>
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
                        editingUser ? 'Save Updates' : 'Create User'
                      )}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
