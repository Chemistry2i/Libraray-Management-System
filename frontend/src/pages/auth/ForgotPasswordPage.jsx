import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { authAPI } from '../../api/endpoints'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call forgot password API
      const response = await authAPI.forgotPassword({ email })
      toast.success(response.data?.message || 'Password reset link sent to your email')
      setSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-airbnb-lg p-8">
        <Link to="/login" className="inline-flex items-center text-primary hover:underline mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {sent ? (
          <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
            <p className="text-success font-medium">Check your email!</p>
            <p className="text-sm text-gray-600 mt-2">We've sent a password reset link to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Email</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
