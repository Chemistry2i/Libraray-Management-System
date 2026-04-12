// Constants used throughout the app

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Blis Library'

// Book status
export const BOOK_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  RESERVED: 'reserved',
  OUT_OF_STOCK: 'out_of_stock'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  USER: 'user'
}

// Loan periods
export const LOAN_PERIODS = {
  TWO_WEEKS: 14,
  ONE_MONTH: 30,
  THREE_MONTHS: 90
}

// Fine amounts
export const FINE_AMOUNTS = {
  PER_DAY: 1.5,
  MAX_FINE: 50
}

// Toast config
export const TOAST_CONFIG = {
  position: 'bottom-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1
}

// Sort options
export const SORT_OPTIONS = {
  LATEST: { value: 'latest', label: 'Latest' },
  POPULAR: { value: 'popular', label: 'Most Popular' },
  RATING: { value: 'rating', label: 'Top Rated' },
  TITLE_ASC: { value: 'title_asc', label: 'Title (A-Z)' },
  TITLE_DESC: { value: 'title_desc', label: 'Title (Z-A)' }
}
