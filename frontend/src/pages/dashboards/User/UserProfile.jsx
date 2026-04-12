import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Shield, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Profile Updated',
      text: 'Your personal information has been saved successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if(formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match.',
        icon: 'error',
        customClass: { popup: 'rounded-[4px] z-[9999]' }
      });
      return;
    }
    
    Swal.fire({
      title: 'Password Updated',
      text: 'Your password has been changed successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mx-auto border-4 border-white shadow-sm disabled">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-gray-500 capitalize">{user?.role || 'Library Member'}</p>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <User size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow hover:opacity-90 transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Shield size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Change Password</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleChange} 
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button type="submit" className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow hover:bg-gray-800 transition-all">
                  Update Password
                </button>
                <button type="button" className="text-sm font-bold text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
