const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  BOOK_RETRIEVED: 'Books retrieved successfully',
  BOOK_SEARCH_SUCCESS: 'Search completed successfully',
  BOOK_ADDED: 'Book added successfully',
  BOOK_UPDATED: 'Book updated successfully',
  BOOK_DELETED: 'Book deleted successfully',
  CHECKOUT_SUCCESS: 'Book checked out successfully',
  RETURN_SUCCESS: 'Book returned successfully',
  USER_PROFILE_RETRIEVED: 'User profile retrieved',
  PROFILE_UPDATED: 'Profile updated successfully',
  // Category messages
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  // Reservation messages (Greenstone-inspired)
  RESERVATION_CREATED: 'Book reserved successfully',
  RESERVATION_CANCELLED: 'Reservation cancelled successfully',
  RESERVATION_MARKED_READY: 'Reservation marked as ready',
  // Password messages
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset link sent to your email',
  // Renewal & Payment messages
  BOOK_RENEWED: 'Book renewed successfully',
  FINE_PAID: 'Fine paid successfully',
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  BOOK_NOT_FOUND: 'Book not found',
  NO_BOOKS_AVAILABLE: 'No books available for checkout',
  ALREADY_BORROWED: 'You already have this book borrowed',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  NO_PERMISSION: 'You do not have permission for this action',
  // Category errors
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_EXISTS: 'Category name already exists',
  // Reservation errors (KYU Space-inspired)
  RESERVATION_NOT_FOUND: 'Reservation not found',
  ALREADY_RESERVED: 'You already have a reservation for this book',
  BOOK_AVAILABLE: 'This book is currently available. Please checkout instead.',
  // Password errors
  PASSWORD_MISMATCH: 'Passwords do not match',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_SAME: 'New password must be different from current password',
  // Renewal & Payment errors
  CANNOT_RENEW: 'Cannot renew this book',
  CANNOT_PAY_FINE: 'Cannot pay fine for this book',
  INVALID_AMOUNT: 'Invalid payment amount',
};

module.exports = {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
};
