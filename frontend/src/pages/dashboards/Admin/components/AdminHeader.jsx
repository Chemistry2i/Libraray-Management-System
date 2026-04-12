import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-10 relative">
      {/* Left side: Mobile menu toggle & Search */}
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-primary transition-colors lg:hidden">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search books, users, or IDs (Press ⌘K)" 
            className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right side: Notifications & User profile snippet */}
      <div className="flex items-center gap-5">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
            {user?.firstName?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
