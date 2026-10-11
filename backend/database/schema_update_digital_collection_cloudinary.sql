ALTER TABLE digital_objects
  ADD COLUMN storage_provider ENUM('local', 'cloudinary') NOT NULL DEFAULT 'local' AFTER file_path,
  ADD COLUMN cloudinary_resource_type VARCHAR(20) NULL AFTER storage_provider,
  ADD COLUMN cloudinary_version BIGINT NULL AFTER cloudinary_resource_type,
  ADD COLUMN cloudinary_format VARCHAR(20) NULL AFTER cloudinary_version;