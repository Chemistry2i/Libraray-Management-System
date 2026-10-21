-- Kamuli CU Library: fresh MySQL 8 schema for Railway
-- Run this against an EMPTY database selected in Railway.
-- This is a consolidated clean-install schema. Do not run it as an upgrade over
-- an existing LMS database; use the incremental scripts in ../database instead.
-- All application tables are created in foreign-key dependency order.

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  profile_image_url VARCHAR(500) DEFAULT NULL,
  role ENUM('admin', 'librarian', 'member') NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category_id INT,
  publication_year INT,
  publisher VARCHAR(100),
  description LONGTEXT,
  cover_url VARCHAR(500) DEFAULT NULL,
  cover_cloudinary_public_id VARCHAR(255) DEFAULT NULL,
  book_file_url VARCHAR(500) DEFAULT NULL,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_category FOREIGN KEY (category_id)
    REFERENCES categories(category_id) ON DELETE SET NULL,
  INDEX idx_books_title (title),
  INDEX idx_books_author (author),
  INDEX idx_books_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS book_copies (
  copy_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  status ENUM('available', 'borrowed', 'damaged', 'reserved') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_copies_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_book_copies_book (book_id),
  INDEX idx_book_copies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS borrowing_records (
  borrow_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  copy_id INT NOT NULL,
  checkout_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  status ENUM('pending_approval', 'active', 'returned', 'overdue', 'rejected') NOT NULL DEFAULT 'pending_approval',
  approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  approved_by INT DEFAULT NULL,
  approval_date TIMESTAMP NULL DEFAULT NULL,
  rejection_reason VARCHAR(500) DEFAULT NULL,
  renewals_count INT NOT NULL DEFAULT 0,
  fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_borrowing_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_borrowing_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  CONSTRAINT fk_borrowing_copy FOREIGN KEY (copy_id)
    REFERENCES book_copies(copy_id) ON DELETE CASCADE,
  CONSTRAINT fk_borrowing_approved_by FOREIGN KEY (approved_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_borrowing_user (user_id),
  INDEX idx_borrowing_book (book_id),
  INDEX idx_borrowing_copy (copy_id),
  INDEX idx_borrowing_status (status),
  INDEX idx_borrowing_approval_status (approval_status),
  INDEX idx_borrowing_approved_by (approved_by),
  INDEX idx_borrowing_due_date (due_date),
  INDEX idx_borrowing_return_date (return_date),
  INDEX idx_borrowing_user_approval (user_id, approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  reservation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'ready', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reservations_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_reservations_user (user_id),
  INDEX idx_reservations_book (book_id),
  INDEX idx_reservations_status (status),
  INDEX idx_reservations_queue (book_id, status, reservation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(512) NOT NULL,
  user_id INT NOT NULL,
  blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_token_blacklist_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_token_blacklist_token (token),
  INDEX idx_token_blacklist_user (user_id),
  INDEX idx_token_blacklist_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reset_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_password_resets_user (user_id),
  INDEX idx_password_resets_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (`read`),
  INDEX idx_notifications_created (created_at),
  INDEX idx_notifications_user_read (user_id, `read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_reviews_user_book (user_id, book_id),
  INDEX idx_reviews_book (book_id),
  INDEX idx_reviews_user (user_id),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- This unified table supports both manual fine payments and scheduled overdue-fine records.
CREATE TABLE IF NOT EXISTS fine_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  amount DECIMAL(10, 2) DEFAULT NULL,
  fine_amount DECIMAL(10, 2) DEFAULT NULL,
  days_overdue INT DEFAULT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  transaction_id VARCHAR(100) DEFAULT NULL,
  payment_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'paid', 'waived') NOT NULL DEFAULT 'pending',
  paid_by INT DEFAULT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fine_payments_borrow FOREIGN KEY (borrow_id)
    REFERENCES borrowing_records(borrow_id) ON DELETE SET NULL,
  CONSTRAINT fk_fine_payments_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_fine_payments_paid_by FOREIGN KEY (paid_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_fine_payments_transaction (transaction_id),
  INDEX idx_fine_payments_user_status (user_id, status),
  INDEX idx_fine_payments_borrow (borrow_id),
  INDEX idx_fine_payments_created (created_at),
  INDEX idx_fine_payments_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_activity_logs_user (user_id),
  INDEX idx_activity_logs_action (action),
  INDEX idx_activity_logs_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_user_book (user_id, book_id),
  INDEX idx_wishlist_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS waitlist (
  waitlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  status ENUM('waiting', 'notified', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notified_at TIMESTAMP NULL DEFAULT NULL,
  fulfilled_at TIMESTAMP NULL DEFAULT NULL,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_waitlist_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_waitlist_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  UNIQUE KEY uq_waitlist_user_book_status (user_id, book_id, status),
  INDEX idx_waitlist_book_status (book_id, status),
  INDEX idx_waitlist_user_status (user_id, status),
  INDEX idx_waitlist_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS book_views (
  view_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_views_book FOREIGN KEY (book_id)
    REFERENCES books(book_id) ON DELETE CASCADE,
  CONSTRAINT fk_book_views_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_book_views_book (book_id),
  INDEX idx_book_views_user (user_id),
  INDEX idx_book_views_time (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS borrowing_audit (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  performed_by INT NOT NULL,
  performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  details JSON,
  CONSTRAINT fk_borrowing_audit_borrow FOREIGN KEY (borrow_id)
    REFERENCES borrowing_records(borrow_id) ON DELETE CASCADE,
  CONSTRAINT fk_borrowing_audit_user FOREIGN KEY (performed_by)
    REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_borrowing_audit_borrow (borrow_id),
  INDEX idx_borrowing_audit_user (performed_by),
  INDEX idx_borrowing_audit_time (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_collections (
  collection_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  selection_criteria TEXT NOT NULL,
  collection_value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_digital_collection_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_objects (
  object_id INT AUTO_INCREMENT PRIMARY KEY,
  dc_identifier VARCHAR(64) DEFAULT NULL,
  collection_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  creator VARCHAR(255),
  dc_date VARCHAR(100) DEFAULT NULL,
  dc_subject TEXT,
  dc_description TEXT,
  dc_type VARCHAR(100) NOT NULL,
  dc_language VARCHAR(100) DEFAULT NULL,
  material_type ENUM(
    'Historical Photograph', 'Newsletter', 'Report', 'Newspaper Clipping',
    'Exam Paper', 'Poster', 'Local-History Document'
  ) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  storage_provider ENUM('local', 'cloudinary') NOT NULL DEFAULT 'local',
  cloudinary_resource_type VARCHAR(20) DEFAULT NULL,
  cloudinary_version BIGINT DEFAULT NULL,
  cloudinary_format VARCHAR(20) DEFAULT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  rights_status ENUM('Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted') NOT NULL,
  rights_assessment_notes TEXT NOT NULL,
  rights_evidence_reference VARCHAR(500) DEFAULT NULL,
  rights_expires_at DATE DEFAULT NULL,
  rights_reviewed_by INT DEFAULT NULL,
  rights_reviewed_at DATETIME DEFAULT NULL,
  rights_assessed BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_object_collection FOREIGN KEY (collection_id)
    REFERENCES digital_collections(collection_id) ON DELETE CASCADE,
  CONSTRAINT fk_digital_object_rights_reviewer FOREIGN KEY (rights_reviewed_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_digital_objects_collection (collection_id),
  INDEX idx_digital_objects_public (is_public),
  INDEX idx_digital_objects_rights (rights_status, rights_expires_at),
  INDEX idx_digital_objects_reviewer (rights_reviewed_by),
  UNIQUE KEY uq_digital_objects_dc_identifier (dc_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_object_rights_history (
  history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  object_id INT NOT NULL,
  rights_status ENUM('Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted') NOT NULL,
  rights_assessment_notes TEXT NOT NULL,
  evidence_reference VARCHAR(500),
  expires_at DATE,
  reviewed_by INT DEFAULT NULL,
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_rights_history_object FOREIGN KEY (object_id)
    REFERENCES digital_objects(object_id) ON DELETE CASCADE,
  CONSTRAINT fk_digital_rights_history_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_digital_rights_history_object (object_id, reviewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS digital_object_events (
  event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  object_id INT NOT NULL,
  event_type ENUM('view', 'download') NOT NULL,
  user_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_object_event_object FOREIGN KEY (object_id)
    REFERENCES digital_objects(object_id) ON DELETE CASCADE,
  CONSTRAINT fk_digital_object_event_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_digital_object_event_date (event_type, created_at),
  INDEX idx_digital_object_event_object (object_id, event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW borrowing_stats AS
SELECT
  u.user_id,
  u.username,
  COUNT(CASE WHEN br.status = 'active' THEN 1 END) AS active_borrowings,
  COUNT(CASE WHEN br.approval_status = 'pending' THEN 1 END) AS pending_requests,
  COUNT(CASE WHEN br.status = 'overdue' THEN 1 END) AS overdue_books,
  COALESCE(SUM(CASE WHEN br.fine_amount > 0 THEN br.fine_amount ELSE 0 END), 0) AS total_fines,
  MAX(br.due_date) AS next_due_date
FROM users u
LEFT JOIN borrowing_records br ON u.user_id = br.user_id
GROUP BY u.user_id, u.username;

CREATE OR REPLACE VIEW system_borrowing_stats AS
SELECT 'total_active' AS metric, COUNT(*) AS count FROM borrowing_records WHERE status = 'active'
UNION ALL
SELECT 'total_pending', COUNT(*) FROM borrowing_records WHERE approval_status = 'pending'
UNION ALL
SELECT 'total_overdue', COUNT(*) FROM borrowing_records WHERE status = 'overdue'
UNION ALL
SELECT 'total_returned', COUNT(*) FROM borrowing_records WHERE status = 'returned'
UNION ALL
SELECT 'total_outstanding_fines', COALESCE(SUM(fine_amount), 0) FROM borrowing_records WHERE fine_amount > 0;
