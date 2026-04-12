-- Add cover_url and book_file_url columns to books table
ALTER TABLE books ADD COLUMN cover_url VARCHAR(255) NOT NULL AFTER description;
ALTER TABLE books ADD COLUMN book_file_url VARCHAR(255) NOT NULL AFTER cover_url;