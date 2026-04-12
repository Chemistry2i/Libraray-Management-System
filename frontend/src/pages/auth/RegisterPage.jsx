import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.email.split('@')[0], // Generate username from email
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
      toast.success(response.message || 'Registration successful!')
      navigate('/user/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-airbnb-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Join Blis</h1>
          <p className="text-gray-600">Create your library account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">First Name</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Email</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Phone</label>
            <div className="relative">
              <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-primary"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Confirm Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-primary"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
