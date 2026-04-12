// User Roles
const ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  MEMBER: 'member',
};

// Book Status
const BOOK_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  DAMAGED: 'damaged',
  RESERVED: 'reserved',
};

// Borrow Status
const BORROW_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
};

// Reservation Status (Greenstone-inspired queue management)
const RESERVATION_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// Constants
const FINE_PER_DAY = 10;
const MAX_BORROW_DAYS = 14;
const MAX_RENEWALS = 2;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

module.exports = {
  ROLES,
  BOOK_STATUS,
  BORROW_STATUS,
  RESERVATION_STATUS,
  FINE_PER_DAY,
  MAX_BORROW_DAYS,
  MAX_RENEWALS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
};
