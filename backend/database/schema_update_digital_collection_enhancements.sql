ALTER TABLE digital_objects
  ADD COLUMN rights_evidence_reference VARCHAR(500) NULL AFTER rights_assessment_notes,
  ADD COLUMN rights_expires_at DATE NULL AFTER rights_evidence_reference,
  ADD COLUMN rights_reviewed_by INT NULL AFTER rights_expires_at,
  ADD COLUMN rights_reviewed_at DATETIME NULL AFTER rights_reviewed_by,
  ADD CONSTRAINT fk_digital_object_rights_reviewer
    FOREIGN KEY (rights_reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS digital_object_rights_history (
  history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  object_id INT NOT NULL,
  rights_status ENUM('Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted') NOT NULL,
  rights_assessment_notes TEXT NOT NULL,
  evidence_reference VARCHAR(500),
  expires_at DATE,
  reviewed_by INT,
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_rights_history_object FOREIGN KEY (object_id)
    REFERENCES digital_objects(object_id) ON DELETE CASCADE,
  CONSTRAINT fk_digital_rights_history_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_digital_rights_history_object (object_id, reviewed_at)
);

INSERT INTO digital_object_rights_history
  (object_id, rights_status, rights_assessment_notes, reviewed_at)
SELECT o.object_id, o.rights_status, o.rights_assessment_notes, o.updated_at
FROM digital_objects o
WHERE o.rights_assessed = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM digital_object_rights_history h WHERE h.object_id = o.object_id
  );

CREATE TABLE IF NOT EXISTS digital_object_events (
  event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  object_id INT NOT NULL,
  event_type ENUM('view', 'download') NOT NULL,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_digital_object_event_object FOREIGN KEY (object_id)
    REFERENCES digital_objects(object_id) ON DELETE CASCADE,
  CONSTRAINT fk_digital_object_event_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_digital_object_event_date (event_type, created_at),
  INDEX idx_digital_object_event_object (object_id, event_type, created_at)
);