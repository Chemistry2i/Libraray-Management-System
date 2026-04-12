import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faUser, faSignOutAlt, faHome, faBook, faBell, faCog } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBook} className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold text-primary">Blis</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link to="/books" className="text-gray-700 hover:text-primary transition">Books</Link>
            {isAuthenticated && (
              <>
                <Link to="/user/my-books" className="text-gray-700 hover:text-primary transition">My Books</Link>
                <Link to="/user/reservations" className="text-gray-700 hover:text-primary transition">Reservations</Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="relative">
                  <FontAwesomeIcon icon={faBell} className="text-primary text-lg" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
                <div className="relative group flex items-center h-full">
                  <button className="flex items-center space-x-2 p-2 bg-light rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0)}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                    <div className="bg-white rounded-lg shadow-airbnb-lg overflow-hidden pb-1">
                      <Link to="/user/profile" className="block px-4 py-2 hover:bg-light text-sm">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-primary" />
                        Profile
                      </Link>
                      <Link to="/user/dashboard" className="block px-4 py-2 hover:bg-light text-sm">
                        <FontAwesomeIcon icon={faCog} className="mr-2 text-primary" />
                        Dashboard
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-light text-sm border-t">
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-danger" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary transition">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 text-xl"
          >
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">Home</Link>
            <Link to="/books" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">Books</Link>
            {isAuthenticated ? (
              <>
                <Link to="/user/my-books" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">My Books</Link>
                <Link to="/user/reservations" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">Reservations</Link>
                <Link to="/user/profile" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-danger hover:bg-light rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">Login</Link>
                <Link to="/register" className="block px-4 py-2 btn-primary text-center rounded">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
