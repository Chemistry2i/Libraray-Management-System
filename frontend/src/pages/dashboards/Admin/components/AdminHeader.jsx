import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to end your session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, log out',
      customClass: { popup: 'rounded-[4px] z-[9999]' }
    });

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-1 relative">
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

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role || 'Admin'}</p>
              </div>
              
              <button 
                onClick={() => setIsDropdownOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
              >
                <User size={16} /> My Profile
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
