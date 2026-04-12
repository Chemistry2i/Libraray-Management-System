/**
 * LMS DATABASE SCHEMA
 * Run this SQL script to create all necessary tables
 */

-- User Table (for authentication)
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('admin', 'librarian', 'member') DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

-- Category Table (Book categories)
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books Table (Main catalog)
CREATE TABLE books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category_id INT,
  publication_year INT,
  publisher VARCHAR(100),
  description LONGTEXT,
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_isbn (isbn)
);

-- Book Copies Table (Track individual copies)
CREATE TABLE book_copies (
  copy_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  status ENUM('available', 'borrowed', 'damaged', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_book_id (book_id),
  INDEX idx_status (status)
);

-- Borrowing Records Table
CREATE TABLE borrowing_records (
  borrow_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  copy_id INT NOT NULL,
  checkout_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  return_date DATE,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  FOREIGN KEY (copy_id) REFERENCES book_copies(copy_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- Reservation Table
CREATE TABLE reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'ready', 'expired', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_status (status)
);

-- Token Blacklist Table (for logout functionality)
CREATE TABLE token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(512) NOT NULL,
  user_id INT,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token)
);