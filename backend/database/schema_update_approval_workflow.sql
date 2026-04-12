/**
 * LMS DATABASE MIGRATION - Approval Workflow
 * Adds approval management fields to borrowing_records table
 * Run this SQL script to enable the borrowing approval system
 */

-- Add approval workflow fields to borrowing_records
ALTER TABLE borrowing_records
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER status,
ADD COLUMN approved_by INT AFTER approval_status,
ADD COLUMN approval_date TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason VARCHAR(500) AFTER approval_date,
ADD COLUMN renewals_count INT DEFAULT 0 AFTER rejection_reason;

-- Add foreign key for approved_by
ALTER TABLE borrowing_records
ADD CONSTRAINT fk_approval_user FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Create index for faster approval status queries
CREATE INDEX idx_approval_status ON borrowing_records(approval_status);
CREATE INDEX idx_approved_by ON borrowing_records(approved_by);

-- Update status enum to include new statuses
-- Note: MySQL requires recreating the column for ENUM changes
ALTER TABLE borrowing_records
MODIFY COLUMN status ENUM('pending_approval', 'active', 'returned', 'overdue', 'rejected') DEFAULT 'pending_approval';

-- Optional: Create audit table for tracking all borrowing changes
CREATE TABLE IF NOT EXISTS borrowing_audit (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  performed_by INT NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  details JSON,
  FOREIGN KEY (borrow_id) REFERENCES borrowing_records(borrow_id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_borrow_id (borrow_id),
  INDEX idx_performed_by (performed_by),
  INDEX idx_performed_at (performed_at)
);

-- Optional: Create fine payments history table (if not exists)
CREATE TABLE IF NOT EXISTS fine_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  transaction_id VARCHAR(100) UNIQUE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(255),
  FOREIGN KEY (borrow_id) REFERENCES borrowing_records(borrow_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_borrow_id (borrow_id),
  INDEX idx_user_id (user_id),
  INDEX idx_payment_date (payment_date)
);

-- Create borrowing statistics view for dashboard
CREATE OR REPLACE VIEW borrowing_stats AS
SELECT 
  u.user_id,
  u.username,
  COUNT(CASE WHEN br.status = 'active' THEN 1 END) as active_borrowings,
  COUNT(CASE WHEN br.approval_status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN br.status = 'overdue' THEN 1 END) as overdue_books,
  SUM(CASE WHEN br.fine_amount > 0 THEN br.fine_amount ELSE 0 END) as total_fines,
  MAX(br.due_date) as next_due_date
FROM users u
LEFT JOIN borrowing_records br ON u.user_id = br.user_id
GROUP BY u.user_id, u.username;

-- Create system-wide statistics view
CREATE OR REPLACE VIEW system_borrowing_stats AS
SELECT 
  'total_active' as metric,
  COUNT(*) as count
FROM borrowing_records 
WHERE status = 'active'
UNION ALL
SELECT 'total_pending', COUNT(*) FROM borrowing_records WHERE approval_status = 'pending'
UNION ALL
SELECT 'total_overdue', COUNT(*) FROM borrowing_records WHERE status = 'overdue'
UNION ALL
SELECT 'total_returned', COUNT(*) FROM borrowing_records WHERE status = 'returned'
UNION ALL
SELECT 'total_outstanding_fines', COALESCE(SUM(fine_amount), 0) FROM borrowing_records WHERE fine_amount > 0;
