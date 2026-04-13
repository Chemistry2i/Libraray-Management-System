import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, ChevronDown, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { notificationAPI } from '../../../../api/endpoints';
import Swal from 'sweetalert2';
import NotificationCenter from './NotificationCenter';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch unread count on mount
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [dropdownRef]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      const notifs = response.data?.data?.items || [];
      const unread = Array.isArray(notifs) ? notifs.filter(n => !n.read).length : 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-50 relative">
      <div className="flex items-center gap-6 w-full max-w-xl">
        <button className="text-gray-500 hover:text-primary transition-colors lg:hidden">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden md:block w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search books, authors, or genres..." 
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5 ml-auto pl-4">
        <Link to="/books" className="hidden sm:block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          Browse Catalog &rarr;
        </Link>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <button 
          onClick={() => setIsNotificationOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { setIsDropdownOpen(false); navigate('/user'); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <div className="h-px bg-gray-100 my-1"></div>

              <button 
                onClick={() => { setIsDropdownOpen(false); navigate('/user/profile'); }}
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

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)}
        onNotificationRead={fetchUnreadCount}
      />
    </header>
  );
}
