CREATE TABLE IF NOT EXISTS digital_collections (
  collection_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  selection_criteria TEXT NOT NULL,
  collection_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_digital_collection_title (title)
);

CREATE TABLE IF NOT EXISTS digital_objects (
  object_id INT AUTO_INCREMENT PRIMARY KEY,
  dc_identifier VARCHAR(64) DEFAULT NULL UNIQUE,
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
  file_path VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  rights_status ENUM('Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted') NOT NULL,
  rights_assessment_notes TEXT NOT NULL,
  rights_assessed BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_object_collection FOREIGN KEY (collection_id)
    REFERENCES digital_collections(collection_id) ON DELETE CASCADE,
  INDEX idx_digital_object_collection (collection_id),
  INDEX idx_digital_object_public (is_public)
);