const pool = require('../config/database');
const { DatabaseError, NotFoundError } = require('../exceptions/AppError');

class UserModel {
  static async delete(userId) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
      if (result.affectedRows === 0) {
        throw new NotFoundError('User not found');
      }
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
  static async findById(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, username, email, first_name, last_name, role, profile_image_url FROM users WHERE user_id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async create(userData) {
    try {
      const { username, email, password_hash, first_name, last_name, phone } = userData;
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, password_hash, first_name, last_name, phone, 'member']
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async getAll(limit, offset) {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, username, email, first_name, last_name, role, profile_image_url, created_at FROM users LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM users');
      return { users: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async update(userId, updateData) {
    try {
      const { first_name, last_name, phone, address } = updateData;
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE user_id = ?',
        [first_name, last_name, phone, address, userId]
      );
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async updateProfileImage(userId, imageUrl) {
    try {
      console.log('UserModel.updateProfileImage called with:', { userId, imageUrl });
      
      const [result] = await pool.query(
        'UPDATE users SET profile_image_url = ? WHERE user_id = ?',
        [imageUrl, userId]
      );
      
      console.log('UPDATE query result:', result);
      console.log('Affected rows:', result.affectedRows);
      
      if (result.affectedRows === 0) {
        console.warn('Update affected 0 rows - user might not exist:', userId);
      }
      
      const updatedUser = await this.findById(userId);
      console.log('Updated user returned:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('UserModel.updateProfileImage error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = UserModel;
