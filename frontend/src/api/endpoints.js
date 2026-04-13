import api from './axios'

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// Book endpoints
export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getCategories: () => api.get('/categories'),
}

// Borrowing endpoints
export const borrowingAPI = {
  borrowBook: (bookId) => api.post('/borrowing/checkout', { bookId }),
  returnBook: (borrowingId) => api.post(`/borrowing/${borrowingId}/return`),
  getMyBooks: () => api.get('/borrowing/my-books'),
  getBorrowingHistory: () => api.get('/borrowing/history'),
  getUserStats: (userId) => api.get(`/borrowing/stats/user/${userId}`),
}

// Reservation endpoints
export const reservationAPI = {
  reserveBook: (bookId) => api.post('/reservations', { bookId }),
  getMyReservations: () => api.get('/reservations/my'),
  cancelReservation: (reservationId) => api.delete(`/reservations/${reservationId}`),
}

// Review endpoints
export const reviewAPI = {
  getBookReviews: (bookId) => api.get(`/books/${bookId}/reviews`),
  createReview: (bookId, reviewData) => api.post(`/books/${bookId}/reviews`, reviewData),
  updateReview: (bookId, reviewId, reviewData) => api.put(`/books/${bookId}/reviews/${reviewId}`, reviewData),
  deleteReview: (bookId, reviewId) => api.delete(`/books/${bookId}/reviews/${reviewId}`),
}

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  uploadProfileImage: (formData) => api.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTotalBooks: () => api.get('/dashboard/total-books'),
  getOverdueBooks: () => api.get('/dashboard/overdues'),
  getRecentBorrowings: () => api.get('/dashboard/recent-borrowings'),
}

// Notification endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUserNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
}
