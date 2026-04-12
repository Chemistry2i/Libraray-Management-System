-- Add waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  waitlist_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  status ENUM('waiting', 'notified', 'fulfilled', 'cancelled') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_at TIMESTAMP NULL,
  fulfilled_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  UNIQUE KEY unique_active_waitlist (user_id, book_id, status),
  INDEX idx_book_waitlist (book_id, status),
  INDEX idx_user_waitlist (user_id, status),
  INDEX idx_created (created_at)
);

-- Add indexes for performance if they don't exist
ALTER TABLE borrowing_records ADD INDEX idx_approval_status (approval_status);
ALTER TABLE borrowing_records ADD INDEX idx_return_date (return_date);
ALTER TABLE borrowing_records ADD INDEX idx_user_status (user_id, approval_status);

-- Add fine_payments table if not exists
CREATE TABLE IF NOT EXISTS fine_payments (
  fine_id INT PRIMARY KEY AUTO_INCREMENT,
  borrow_id INT,
  user_id INT NOT NULL,
  fine_amount DECIMAL(10, 2) NOT NULL,
  days_overdue INT,
  payment_date TIMESTAMP NULL,
  status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (borrow_id) REFERENCES borrowing_records(borrow_id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
);


CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  `read` BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_notifications ON notifications(user_id, `read`);