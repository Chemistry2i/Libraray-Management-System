import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartPie, faBook, faUsers, faExchangeAlt, 
  faMoneyBillWave, faCog, faSignOutAlt, faShieldAlt,
  faClock, faTags, faChartLine, faStar
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../../../context/AuthContext'

const navItems = [
  { name: 'Overview', path: '/admin', icon: faChartPie },
  { name: 'Books & Inventory', path: '/admin/books', icon: faBook },
  { name: 'Categories & Genres', path: '/admin/categories', icon: faTags },
  { name: 'Borrowing Management', path: '/admin/borrowing', icon: faExchangeAlt },
  { name: 'Holds & Reservations', path: '/admin/reservations', icon: faClock },
  { name: 'Patrons & Users', path: '/admin/users', icon: faUsers },
  { name: 'Reviews & Moderation', path: '/admin/reviews', icon: faStar },
  { name: 'Fines & Billing', path: '/admin/fines', icon: faMoneyBillWave },
  { name: 'Reports & Analytics', path: '/admin/reports', icon: faChartLine },
  { name: 'System Settings', path: '/admin/settings', icon: faCog },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-72 bg-white text-gray-800 flex flex-col min-h-screen sticky top-0 border-r border-gray-200 shadow-sm">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Blis Admin</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
              <FontAwesomeIcon icon={faShieldAlt} className="text-success" /> Authorized
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-[1.02]' 
                  : 'text-gray-500 hover:text-primary hover:bg-primary/5 font-medium'
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="text-lg w-6" />
            {item.name}
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
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-danger/10 text-gray-600 hover:text-danger hover:border-danger/30 transition-colors text-sm font-bold shadow-sm"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          Secure Logout
        </button>
      </div>
    </aside>
  )
}