const pool = require('../config/database');

const publicAccessClause = `o.is_public = TRUE AND o.rights_assessed = TRUE
  AND o.rights_status <> 'Sensitive - Restricted'
  AND (o.rights_expires_at IS NULL OR o.rights_expires_at >= CURRENT_DATE())`;

class DigitalCollectionModel {
  static async findCollections() {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(o.object_id) AS object_count
       FROM digital_collections c
       LEFT JOIN digital_objects o ON o.collection_id = c.collection_id
       GROUP BY c.collection_id ORDER BY c.created_at DESC`
    );
    return rows;
  }

  static async findCollectionById(collectionId) {
    const [rows] = await pool.query(
      'SELECT * FROM digital_collections WHERE collection_id = ?', [collectionId]
    );
    return rows[0] || null;
  }

  static async createCollection(collection) {
    const [result] = await pool.query(
      `INSERT INTO digital_collections
       (title, description, selection_criteria, collection_value) VALUES (?, ?, ?, ?)`,
      [collection.title, collection.description || null, collection.selection_criteria, collection.collection_value]
    );
    return result.insertId;
  }

  static async updateCollection(collectionId, collection) {
    const [result] = await pool.query(
      `UPDATE digital_collections
       SET title = ?, description = ?, selection_criteria = ?, collection_value = ?
       WHERE collection_id = ?`,
      [collection.title, collection.description || null, collection.selection_criteria, collection.collection_value, collectionId]
    );
    return result.affectedRows;
  }

  static async findPublicCollections() {
    const [rows] = await pool.query(
      `SELECT DISTINCT c.collection_id, c.title
       FROM digital_collections c
       JOIN digital_objects o ON o.collection_id = c.collection_id
       WHERE ${publicAccessClause}
       ORDER BY c.title`
    );
    return rows;
  }

  static async findObjects(collectionId) {
    const [rows] = await pool.query(
      `SELECT o.*, u.first_name AS rights_reviewer_first_name,
              u.last_name AS rights_reviewer_last_name
       FROM digital_objects o
       LEFT JOIN users u ON u.user_id = o.rights_reviewed_by
       WHERE o.collection_id = ? ORDER BY o.created_at DESC`,
      [collectionId]
    );
    return rows;
  }

  static async findPublicObjects(filters) {
    const where = [publicAccessClause];
    const params = [];
    if (filters.search) {
      where.push('(o.title LIKE ? OR o.creator LIKE ? OR c.title LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (filters.collectionId) {
      where.push('o.collection_id = ?');
      params.push(filters.collectionId);
    }
    if (filters.materialType) {
      where.push('o.material_type = ?');
      params.push(filters.materialType);
    }
    const sortColumns = {
      newest: 'o.created_at DESC',
      oldest: 'o.created_at ASC',
      title: 'o.title ASC',
      popular: 'view_count DESC, download_count DESC, o.created_at DESC',
    };
    const baseQuery = `FROM digital_objects o
      JOIN digital_collections c ON c.collection_id = o.collection_id
      LEFT JOIN (
        SELECT object_id,
          SUM(event_type = 'view') AS view_count,
          SUM(event_type = 'download') AS download_count
        FROM digital_object_events GROUP BY object_id
      ) event_usage ON event_usage.object_id = o.object_id
      WHERE ${where.join(' AND ')}`;
    const [[count]] = await pool.query(
      `SELECT COUNT(*) AS total FROM digital_objects o
       JOIN digital_collections c ON c.collection_id = o.collection_id
       WHERE ${where.join(' AND ')}`,
      params
    );
    const [objects] = await pool.query(
      `SELECT o.object_id, o.collection_id, c.title AS collection_title,
              o.title, o.creator, o.material_type, o.mime_type, o.file_size,
              o.rights_status, o.created_at,
              COALESCE(event_usage.view_count, 0) AS view_count,
              COALESCE(event_usage.download_count, 0) AS download_count
       ${baseQuery}
       ORDER BY ${sortColumns[filters.sort] || sortColumns.newest}
       LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset]
    );
    return { objects, total: Number(count.total) };
  }

  static async createObjects(collectionId, objects, reviewerId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const object of objects) {
        const [result] = await connection.query(
          `INSERT INTO digital_objects
           (collection_id, title, creator, material_type, file_path, original_filename,
            storage_provider, cloudinary_resource_type, cloudinary_version,
            mime_type, file_size, rights_status, rights_assessment_notes, rights_assessed,
            is_public, rights_evidence_reference, rights_expires_at, rights_reviewed_by, rights_reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            collectionId, object.title, object.creator || null, object.material_type,
            object.file_path, object.original_filename, object.storage_provider || 'local',
            object.cloudinary_resource_type || null, object.cloudinary_version || null,
            object.mime_type, object.file_size,
            object.rights_status, object.rights_assessment_notes, object.is_public,
            object.rights_evidence_reference || null, object.rights_expires_at || null, reviewerId,
          ]
        );
        await connection.query(
          `INSERT INTO digital_object_rights_history
           (object_id, rights_status, rights_assessment_notes, evidence_reference, expires_at, reviewed_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [result.insertId, object.rights_status, object.rights_assessment_notes,
            object.rights_evidence_reference || null, object.rights_expires_at || null, reviewerId]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findObjectById(objectId, publicOnly = false) {
    const [rows] = await pool.query(
      `SELECT * FROM digital_objects o WHERE o.object_id = ?${publicOnly ? ` AND ${publicAccessClause}` : ''}`,
      [objectId]
    );
    return rows[0] || null;
  }

  static async findRightsHistory(objectId) {
    const [rows] = await pool.query(
      `SELECT h.*, u.first_name, u.last_name
       FROM digital_object_rights_history h
       LEFT JOIN users u ON u.user_id = h.reviewed_by
       WHERE h.object_id = ? ORDER BY h.reviewed_at DESC, h.history_id DESC`,
      [objectId]
    );
    return rows;
  }

  static async updateObject(objectId, changes, reviewerId, rightsChanged) {
    const allowedColumns = [
      'title', 'creator', 'material_type', 'rights_status', 'rights_assessment_notes',
      'rights_evidence_reference', 'rights_expires_at', 'is_public',
    ];
    const updates = Object.entries(changes).filter(([key]) => allowedColumns.includes(key));
    if (rightsChanged) {
      updates.push(['rights_assessed', true], ['rights_reviewed_by', reviewerId], ['rights_reviewed_at', new Date()]);
    }
    if (!updates.length) return 0;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const setSql = updates.map(([column]) => `\`${column}\` = ?`).join(', ');
      const [result] = await connection.query(
        `UPDATE digital_objects SET ${setSql} WHERE object_id = ?`,
        [...updates.map(([, value]) => value), objectId]
      );
      if (rightsChanged) {
        const [rows] = await connection.query(
          `SELECT rights_status, rights_assessment_notes, rights_evidence_reference,
                  rights_expires_at, rights_reviewed_by
           FROM digital_objects WHERE object_id = ?`,
          [objectId]
        );
        if (rows[0]) {
          const current = rows[0];
          await connection.query(
            `INSERT INTO digital_object_rights_history
             (object_id, rights_status, rights_assessment_notes, evidence_reference, expires_at, reviewed_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [objectId, current.rights_status, current.rights_assessment_notes,
              current.rights_evidence_reference, current.rights_expires_at, current.rights_reviewed_by]
          );
        }
      }
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async setPublicStatus(objectId, isPublic) {
    const [result] = await pool.query(
      `UPDATE digital_objects SET is_public = ?
       WHERE object_id = ?
         AND (? = FALSE OR (rights_assessed = TRUE AND rights_status <> 'Sensitive - Restricted'
           AND (rights_expires_at IS NULL OR rights_expires_at >= CURRENT_DATE())))`,
      [isPublic, objectId, isPublic]
    );
    return result.affectedRows;
  }

  static async recordEvent(objectId, eventType, userId = null) {
    await pool.query(
      'INSERT INTO digital_object_events (object_id, event_type, user_id) VALUES (?, ?, ?)',
      [objectId, eventType, userId]
    );
  }

  static async getAnalytics(from, to) {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_objects,
              COALESCE(SUM(is_public = TRUE AND rights_assessed = TRUE
                AND rights_status <> 'Sensitive - Restricted'
                AND (rights_expires_at IS NULL OR rights_expires_at >= CURRENT_DATE())), 0) AS public_objects,
              COALESCE(SUM(NOT (is_public = TRUE AND rights_assessed = TRUE
                AND rights_status <> 'Sensitive - Restricted'
                AND (rights_expires_at IS NULL OR rights_expires_at >= CURRENT_DATE()))), 0) AS private_objects,
              COALESCE(SUM(file_size), 0) AS storage_bytes,
              COALESCE(SUM(rights_assessed = FALSE), 0) AS unassessed_objects
       FROM digital_objects`
    );
    const [[period]] = await pool.query(
      `SELECT COALESCE(SUM(event_type = 'view'), 0) AS views,
              COALESCE(SUM(event_type = 'download'), 0) AS downloads
       FROM digital_object_events WHERE created_at >= ? AND created_at < ?`,
      [from, to]
    );
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              SUM(event_type = 'view') AS views,
              SUM(event_type = 'download') AS downloads
       FROM digital_object_events WHERE created_at >= ? AND created_at < ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`,
      [from, to]
    );
    const [materials] = await pool.query(
      `SELECT material_type, COUNT(*) AS object_count
       FROM digital_objects GROUP BY material_type ORDER BY object_count DESC`
    );
    const [popularCollections] = await pool.query(
      `SELECT c.collection_id, c.title,
              SUM(e.event_type = 'view') AS views,
              SUM(e.event_type = 'download') AS downloads
       FROM digital_collections c
       LEFT JOIN digital_objects o ON o.collection_id = c.collection_id
       LEFT JOIN digital_object_events e ON e.object_id = o.object_id
         AND e.created_at >= ? AND e.created_at < ?
       GROUP BY c.collection_id ORDER BY (views + downloads) DESC, c.title LIMIT 10`,
      [from, to]
    );
    return { totals, period, monthly, materials, popularCollections };
  }

  static async findObjectsForExport() {
    const [rows] = await pool.query(
            `SELECT c.title AS collection_title, c.selection_criteria,
              c.collection_value, o.object_id, o.title, o.creator,
              o.material_type, o.original_filename, o.rights_status,
              o.rights_assessment_notes, o.rights_evidence_reference,
              o.rights_expires_at, o.is_public, o.rights_reviewed_at,
              u.email AS reviewer_email, o.created_at
       FROM digital_objects o
       JOIN digital_collections c ON c.collection_id = o.collection_id
       LEFT JOIN users u ON u.user_id = o.rights_reviewed_by
       ORDER BY c.title, o.title`
    );
    return rows;
  }

  static async deleteObject(objectId) {
    const [result] = await pool.query('DELETE FROM digital_objects WHERE object_id = ?', [objectId]);
    return result.affectedRows;
  }
}

module.exports = DigitalCollectionModel;