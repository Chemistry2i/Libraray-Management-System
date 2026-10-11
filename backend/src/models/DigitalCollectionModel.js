const pool = require('../config/database');

class DigitalCollectionModel {
  static async findCollections() {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(o.object_id) AS object_count
       FROM digital_collections c
       LEFT JOIN digital_objects o ON o.collection_id = c.collection_id
       GROUP BY c.collection_id
       ORDER BY c.created_at DESC`
    );
    return rows;
  }

  static async findCollectionById(collectionId) {
    const [rows] = await pool.query(
      'SELECT * FROM digital_collections WHERE collection_id = ?',
      [collectionId]
    );
    return rows[0] || null;
  }

  static async createCollection(collection) {
    const [result] = await pool.query(
      `INSERT INTO digital_collections
       (title, description, selection_criteria, collection_value)
       VALUES (?, ?, ?, ?)`,
      [collection.title, collection.description || null, collection.selection_criteria, collection.collection_value]
    );
    return result.insertId;
  }

  static async findObjects(collectionId) {
    const [rows] = await pool.query(
      `SELECT object_id, collection_id, title, creator, material_type,
              original_filename, mime_type, file_size, rights_status,
              rights_assessment_notes, rights_assessed, is_public, created_at
       FROM digital_objects WHERE collection_id = ? ORDER BY created_at DESC`,
      [collectionId]
    );
    return rows;
  }

  static async createObjects(collectionId, objects) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const object of objects) {
        await connection.query(
          `INSERT INTO digital_objects
           (collection_id, title, creator, material_type, file_path, original_filename,
            mime_type, file_size, rights_status, rights_assessment_notes, rights_assessed, is_public)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
          [
            collectionId, object.title, object.creator || null, object.material_type,
            object.file_path, object.original_filename, object.mime_type, object.file_size,
            object.rights_status, object.rights_assessment_notes, object.is_public,
          ]
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
      `SELECT * FROM digital_objects WHERE object_id = ?${publicOnly ? ' AND is_public = TRUE' : ''}`,
      [objectId]
    );
    return rows[0] || null;
  }

  static async findPublicObjects() {
    const [rows] = await pool.query(
      `SELECT o.object_id, o.collection_id, c.title AS collection_title,
              o.title, o.creator, o.material_type, o.mime_type, o.file_size,
        o.rights_status, o.created_at
       FROM digital_objects o
       JOIN digital_collections c ON c.collection_id = o.collection_id
       WHERE o.is_public = TRUE ORDER BY o.created_at DESC`
    );
    return rows;
  }

  static async setPublicStatus(objectId, isPublic) {
    const [result] = await pool.query(
      `UPDATE digital_objects SET is_public = ?
       WHERE object_id = ? AND rights_status <> 'Sensitive - Restricted'`,
      [isPublic, objectId]
    );
    return result.affectedRows;
  }

  static async deleteObject(objectId) {
    const [result] = await pool.query('DELETE FROM digital_objects WHERE object_id = ?', [objectId]);
    return result.affectedRows;
  }
}

module.exports = DigitalCollectionModel;