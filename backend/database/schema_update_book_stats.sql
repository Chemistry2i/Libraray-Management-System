-- Add book statistics tracking

-- Create book_views table to track page views
CREATE TABLE IF NOT EXISTS book_views (
  view_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_book_id (book_id),
  INDEX idx_viewed_at (viewed_at)
);

-- Verify borrowing_records table exists for counting borrows
-- (Already exists, just used to JOIN and count)

-- If needed later, add summary columns to books table:
-- ALTER TABLE books ADD COLUMN total_views INT DEFAULT 0;
-- ALTER TABLE books ADD COLUMN times_borrowed INT DEFAULT 0;
