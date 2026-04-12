/**
 * DATABASE SCHEMA UPDATE - Add Profile Image Support
 * Adds profile image URL column to users table
 * Date: 2026-04-05
 */

-- Add profile_image_url column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL AFTER address;

-- Add index for faster lookups
ALTER TABLE users ADD INDEX idx_user_id (user_id);
