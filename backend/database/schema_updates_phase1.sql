/**
 * LMS DATABASE SCHEMA UPDATES
 * Run these SQL commands to add support for new Phase 1 features
 */

-- Token Blacklist Table (for logout functionality)
CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  user_id INT NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Password Resets Table (for forgot password flow)
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reset_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_reset (user_id),
  INDEX idx_user_id (user_id)
);

-- Notifications Table (for user notifications)
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_read (read),
  INDEX idx_created_at (created_at)
);

-- Reviews Table (for book ratings and reviews)
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book_review (user_id, book_id),
  INDEX idx_book_id (book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating)
);

-- Fine Payments Table (for tracking fine payments)
CREATE TABLE IF NOT EXISTS fine_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_by INT,
  FOREIGN KEY (borrow_id) REFERENCES borrowing_records(borrow_id) ON DELETE CASCADE,
  FOREIGN KEY (paid_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_borrow_id (borrow_id),
  INDEX idx_payment_date (payment_date)
);

-- Add renewal tracking to borrowing_records table
-- Run only if column doesn't exist:
-- ALTER TABLE borrowing_records ADD COLUMN renewals_count INT DEFAULT 0;

-- Activity Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Wishlist Table (for book wishlists)
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book_wish (user_id, book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id)
);
