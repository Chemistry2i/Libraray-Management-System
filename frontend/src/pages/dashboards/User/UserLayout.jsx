import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import UserSidebar from './components/UserSidebar';
import UserHeader from './components/UserHeader';

export default function UserLayout() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans flex-col md:flex-row">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`absolute md:relative w-64 h-screen bg-white z-40 transform transition-transform duration-300 md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <UserSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden md:w-auto">
        <UserHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 px-4 md:px-6 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
