import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import UserSidebar from './components/UserSidebar';
import UserHeader from './components/UserHeader';

export default function UserLayout() {
  const { user } = useAuth();

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <UserSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
