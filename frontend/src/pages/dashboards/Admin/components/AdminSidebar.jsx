import React from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowLeftRight, Banknote, BarChart3, BookOpen, ChartLine, ClipboardList, Clock3, Images, LayoutDashboard, LogOut, Settings, ShieldCheck, Star, Tags, Users } from 'lucide-react'
import { useAuth } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { SCHOOL_BADGE, SCHOOL_NAME } from '../../../../constants/schoolBrand'

const navItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Digital Collections', path: '/admin/digital-collections', icon: Images },
  { name: 'Digital Analytics', path: '/admin/digital-analytics', icon: BarChart3 },
  { name: 'Books & Inventory', path: '/admin/books', icon: BookOpen },
  { name: 'Categories & Genres', path: '/admin/categories', icon: Tags },
  { name: 'Borrowing Management', path: '/admin/borrowing', icon: ArrowLeftRight },
  { name: 'Holds & Reservations', path: '/admin/reservations', icon: Clock3 },
  { name: 'Patrons & Users', path: '/admin/users', icon: Users },
  { name: 'Reviews & Moderation', path: '/admin/reviews', icon: Star },
  { name: 'Fines & Billing', path: '/admin/fines', icon: Banknote },
  { name: 'Reports & Analytics', path: '/admin/reports', icon: ChartLine },
  { name: 'System Settings', path: '/admin/settings', icon: Settings },
  { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function confirmLogout() {
    const result = await Swal.fire({
      title: 'Sign out?',
      text: 'Are you sure you want to end your session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, log out',
      customClass: { container: '!z-[10000]', popup: 'rounded-[4px]' },
    })
    if (result.isConfirmed) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-gray-200 bg-white text-gray-800 shadow-sm">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src={SCHOOL_BADGE} alt="Kamuli Church of Uganda Primary School badge" className="size-11 shrink-0 rounded-full bg-white object-contain ring-1 ring-slate-200" />
          <div>
            <h1 className="text-base font-bold tracking-tight text-gray-900">{SCHOOL_NAME}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" /> School Library
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            end={path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-primary/5 hover:text-primary font-medium'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            {user?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Administrator'}</p>
          </div>
        </div>
        <button 
          onClick={confirmLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-danger/10 text-gray-600 hover:text-danger hover:border-danger/30 transition-colors text-sm font-bold shadow-sm"
        >
          <LogOut size={16} />
          Secure Logout
        </button>
      </div>
    </aside>
  )
}