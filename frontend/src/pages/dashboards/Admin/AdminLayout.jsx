import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import AdminFooter from './components/AdminFooter'
import CommandPalette from '../../../components/CommandPalette'
import { PageTransition } from '../../../components/PageTransition'

export default function AdminLayout() {
  const { user, loading } = useAuth();

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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-outfit">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Flex Container */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-white">
        
        {/* Top Header */}
        <AdminHeader />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full pb-0 flex flex-col justify-between">
          {/* Subtle grid pattern similar to auth page but lighter for main dashboard */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none fixed"></div>
          
          <div className="flex-grow w-full z-10 px-8 py-6 max-w-[1600px] mx-auto">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>

          <AdminFooter />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}