ALTER TABLE books
  ADD COLUMN cover_cloudinary_public_id VARCHAR(255) NULL AFTER cover_url;