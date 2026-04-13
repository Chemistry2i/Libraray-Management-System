import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Pages - Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Pages - Main
import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import BookDetailsPage from './pages/BookDetailsPage'
import MyBooksPage from './pages/MyBooksPage'
import ReservationsPage from './pages/ReservationsPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

// Admin Pages Layout
import AdminLayout from './pages/dashboards/Admin/AdminLayout'
import AdminDashboard from './pages/dashboards/Admin/AdminDashboard'
import AdminBooks from './pages/dashboards/Admin/AdminBooks'
import AdminCategories from './pages/dashboards/Admin/AdminCategories'
import AdminUsers from './pages/dashboards/Admin/AdminUsers'
import AdminBorrowing from './pages/dashboards/Admin/AdminBorrowing'
import AdminReservations from './pages/dashboards/Admin/AdminReservations'
import AdminReviews from './pages/dashboards/Admin/AdminReviews'
import AdminSettings from './pages/dashboards/Admin/AdminSettings'
import AdminFines from './pages/dashboards/Admin/AdminFines'
import AdminReports from './pages/dashboards/Admin/AdminReports'

// User Pages Layout
import UserLayout from './pages/dashboards/User/UserLayout'
import UserDashboard from './pages/dashboards/User/UserDashboard'
import UserBorrowings from './pages/dashboards/User/UserBorrowings'
import UserReservations from './pages/dashboards/User/UserReservations'
import UserFines from './pages/dashboards/User/UserFines'
import UserReviews from './pages/dashboards/User/UserReviews'
import UserProfile from './pages/dashboards/User/UserProfile'
import UserNotifications from './pages/dashboards/User/UserNotifications'

// Context
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Main Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />
            <Route path="/my-books" element={<MyBooksPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="borrowing" element={<AdminBorrowing />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="fines" element={<AdminFines />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="my-books" element={<UserBorrowings />} />
            <Route path="reservations" element={<UserReservations />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="fines" element={<UserFines />} />
            <Route path="reviews" element={<UserReviews />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  )
}
