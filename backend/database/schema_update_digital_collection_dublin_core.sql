ALTER TABLE digital_objects
  ADD COLUMN dc_identifier VARCHAR(64) NULL AFTER object_id,
  ADD COLUMN dc_date VARCHAR(100) NULL AFTER creator,
  ADD COLUMN dc_subject TEXT NULL AFTER dc_date,
  ADD COLUMN dc_description TEXT NULL AFTER dc_subject,
  ADD COLUMN dc_type VARCHAR(100) NULL AFTER dc_description,
  ADD COLUMN dc_language VARCHAR(100) NULL AFTER dc_type;

UPDATE digital_objects
SET dc_identifier = CONCAT('KCU-DC-', LPAD(object_id, 8, '0')),
    dc_type = CASE
      WHEN mime_type LIKE 'image/%' THEN 'StillImage'
      WHEN mime_type LIKE 'video/%' THEN 'MovingImage'
      WHEN mime_type LIKE 'audio/%' THEN 'Sound'
      ELSE 'Text'
    END
WHERE dc_identifier IS NULL OR dc_type IS NULL;

ALTER TABLE digital_objects
  MODIFY COLUMN dc_identifier VARCHAR(64) NOT NULL,
  MODIFY COLUMN dc_type VARCHAR(100) NOT NULL,
  ADD UNIQUE KEY uq_digital_objects_dc_identifier (dc_identifier);
