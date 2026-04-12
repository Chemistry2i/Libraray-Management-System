import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Eye, Shield, UserX } from 'lucide-react';

const AdminUsers = () => {
  // Dummy data for initial display
  const [users, setUsers] = useState([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'Member', status: 'Active', joinDate: 'Oct 12, 2023', activeBorrows: 2, unpaidFines: 0 },
    { id: 2, firstName: 'Sarah', lastName: 'Smith', email: 'sarah.admin@example.com', role: 'Admin', status: 'Active', joinDate: 'Jan 05, 2022', activeBorrows: 0, unpaidFines: 0 },
    { id: 3, firstName: 'Michael', lastName: 'Johnson', email: 'mike.j@example.com', role: 'Member', status: 'Suspended', joinDate: 'Feb 18, 2024', activeBorrows: 4, unpaidFines: 25.50 },
    { id: 4, firstName: 'Emily', lastName: 'Chen', email: 'emily.c@university.edu', role: 'Staff', status: 'Active', joinDate: 'Aug 30, 2023', activeBorrows: 1, unpaidFines: 0 },
    { id: 5, firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@example.com', role: 'Member', status: 'Inactive', joinDate: 'Nov 22, 2021', activeBorrows: 0, unpaidFines: 0 }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <span className="bg-green-50 text-green-700 border-green-200 border px-2.5 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'Suspended':
        return <span className="bg-red-50 text-red-700 border-red-200 border px-2.5 py-1 rounded-full text-xs font-medium">Suspended</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border-gray-200 border px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Admin':
        return <span className="text-purple-700 bg-purple-50 font-semibold px-2 py-0.5 rounded text-xs border border-purple-100 flex items-center gap-1 w-max"><Shield size={12} /> Admin</span>;
      case 'Staff':
        return <span className="text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.5 rounded text-xs border border-indigo-100 w-max">Staff</span>;
      default:
        return <span className="text-gray-600 font-medium px-2 py-0.5 text-xs w-max">Member</span>;
    }
  };

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patrons & Users</h1>
          <p className="text-gray-500 mt-1">Manage library members, staff roles, and user account statuses.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
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
                <th className="p-4 font-semibold">User details</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold hidden md:table-cell">Joined</th>
                <th className="p-4 font-semibold text-center">Circulation</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex flex-shrink-0 items-center justify-center border border-primary/20">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell text-xs">
                    {user.joinDate}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-3 text-xs">
                      <div className="flex flex-col items-center" title="Active Borrows">
                        <span className="font-bold text-gray-700">{user.activeBorrows}</span>
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Books</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <div className="flex flex-col items-center" title="Unpaid Fines">
                        <span className={`font-bold ${user.unpaidFines > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          ${user.unpaidFines.toFixed(2)}
                        </span>
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Fines</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="p-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      {user.status !== 'Suspended' ? (
                        <button className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Suspend User">
                          <UserX size={18} />
                        </button>
                      ) : (
                         <button className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Reactivate User">
                          <Shield size={18} />
                        </button>
                      )}
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
          <p>Showing 1 to 5 of 145 patrons</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;