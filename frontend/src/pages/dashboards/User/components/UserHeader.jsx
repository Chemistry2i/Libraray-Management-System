import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bell, Search, Menu, LogOut, ChevronDown, User, LayoutDashboard, BookOpen } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { notificationAPI } from '../../../../api/endpoints';
import Swal from 'sweetalert2';
import NotificationCenter from './NotificationCenter';
import { openGlobalSearch } from '../../../../components/CommandPalette';

export default function UserHeader({ onMenuToggle }) {
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

      UserHeader.propTypes = {
        onMenuToggle: PropTypes.func.isRequired,
      };
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
      customClass: { container: '!z-[10000]', popup: 'rounded-[4px]' }
    });

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between z-50 relative gap-4">
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <BookOpen size={20} className="text-primary" />
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">My library</p>
            <p className="text-xs text-gray-500">Your reading space</p>
          </div>
        </div>
        <button onClick={onMenuToggle} className="text-gray-500 hover:text-primary transition-colors md:hidden shrink-0">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden sm:block w-full max-w-xs">
          <button
            type="button"
            onClick={() => openGlobalSearch()}
            aria-label="Open global search"
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-4 text-left text-sm text-gray-500 transition-colors hover:border-primary/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Search size={18} className="shrink-0 text-gray-400" />
            <span className="flex-1">Search books or pages...</span>
            <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">Ctrl K</kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-5 ml-auto pl-2 md:pl-4">
        <Link to="/books" className="hidden md:block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          Browse Catalog &rarr;
        </Link>

        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

        <button 
          onClick={() => setIsNotificationOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 md:gap-3 relative shrink-0" ref={dropdownRef}>
          <div className="hidden sm:flex items-center gap-2 md:gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.firstName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <img 
              src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.firstName} ${user?.lastName}&background=4f46e5&color=fff`} 
              alt="Profile" 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0"
            />
          </div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronDown size={16} className={`text-gray-500 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-40 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <Link 
              to="/user/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100 text-sm md:text-base"
            >
              <User size={16} />
              My Profile
            </Link>
            <Link 
              to="/user"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100 text-sm md:text-base"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-red-50 text-red-600 text-left text-sm md:text-base"
            >
              <LogOut size={16} />
              Sign Out
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
        onViewAll={() => {
          setIsNotificationOpen(false);
          navigate('/user/notifications');
        }}
      />
    </header>
  );
}
