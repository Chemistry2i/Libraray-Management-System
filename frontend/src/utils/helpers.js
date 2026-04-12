// Utility functions for common tasks

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date with time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Get stored token
export const getToken = () => {
  return localStorage.getItem('token')
}

// Store token
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

// Remove token
export const removeToken = () => {
  localStorage.removeItem('token')
}

// Get user from localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Store user
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate password strength
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password)
  }
}

// Debounce function
export const debounce = (func, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
