import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  CreditCard,
  MessageSquare,
  User,
  Library,
  Bell
} from 'lucide-react';

export default function UserSidebar({ onClose }) {
  const navItems = [
    { path: '/user', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/user/my-books', icon: BookOpen, label: 'My Borrowings' },
    { path: '/user/reservations', icon: Bookmark, label: 'Reservations' },
    { path: '/user/notifications', icon: Bell, label: 'Notifications' },
    { path: '/user/fines', icon: CreditCard, label: 'My Fines' },
    { path: '/user/reviews', icon: MessageSquare, label: 'My Reviews' },
    { path: '/user/profile', icon: User, label: 'Profile Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col z-40">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-gray-200">
        <div className="flex items-center gap-3 text-primary">
          <Library size={28} className="animate-pulse-slow" />
          <span className="text-2xl font-bold tracking-tight">Blis.</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
          My Library
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-1">Need help?</h4>
          <p className="text-xs text-blue-700 mb-3">Contact the librarian for assistance.</p>
          <button className="w-full py-2 bg-white text-blue-600 rounded-lg text-sm font-bold shadow-sm hover:shadow transition-all border border-blue-100">
            Support
          </button>
        </div>
      </div>
    </aside>
  );
}
