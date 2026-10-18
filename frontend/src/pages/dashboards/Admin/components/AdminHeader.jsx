import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, ChevronDown, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../../../api/endpoints';
import Swal from 'sweetalert2';
import NotificationCenter from '../../User/components/NotificationCenter';
import { openGlobalSearch } from '../../../../components/CommandPalette';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      const notifications = response.data?.data?.items || [];
      setUnreadCount(Array.isArray(notifications) ? notifications.filter((item) => !item.read).length : 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
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
      customClass: { container: '!z-[10000]', popup: 'rounded-[4px]' }
    });

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between relative z-20">
      {/* Left side: Mobile menu toggle & Search */}
      <div className="flex items-center gap-6">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <BookOpen size={20} className="text-primary" />
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">Staff workspace</p>
            <p className="text-xs text-gray-500">Library operations</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-primary transition-colors lg:hidden">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => openGlobalSearch()}
            aria-label="Open global search"
            className="flex w-80 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-4 text-left text-sm text-gray-500 transition-colors hover:border-primary/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Search size={18} className="shrink-0 text-gray-400" />
            <span className="flex-1">Search books or pages...</span>
            <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">Ctrl K</kbd>
          </button>
        </div>
      </div>

      {/* Right side: Notifications & User profile snippet */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setIsNotificationOpen(true)}
          aria-label="Open notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
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
            {user?.profile_image_url
              ? <img src={user.profile_image_url} alt="Profile" className="h-10 w-10 shrink-0 rounded-full border border-primary/20 object-cover" />
              : <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0">
                {user?.firstName?.charAt(0) || 'A'}
              </div>}
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
    <NotificationCenter
      isOpen={isNotificationOpen}
      onClose={() => setIsNotificationOpen(false)}
      onNotificationRead={fetchUnreadCount}
      onViewAll={() => {
        setIsNotificationOpen(false);
        navigate('/user/notifications');
      }}
    />
    </>
  );
}
