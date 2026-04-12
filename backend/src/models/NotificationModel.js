const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class NotificationModel {
  // Create notification
  static async create(notificationData) {
    try {
      const { user_id, type, title, message } = notificationData;
      const [result] = await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, `read`) VALUES (?, ?, ?, ?, ?)',
        [user_id, type, title, message, false]
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get user notifications (paginated)
  static async getUserNotifications(userId, limit, offset) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM notifications WHERE user_id = ?', [
        userId,
      ]);
      return { notifications: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND `read` = false', [userId]);
      return rows[0].unread;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      await pool.query('UPDATE notifications SET `read` = true WHERE notification_id = ?', [notificationId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Mark all as read for user
  static async markAllAsRead(userId) {
    try {
      await pool.query('UPDATE notifications SET `read` = true WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Delete notification
  static async delete(notificationId) {
    try {
      await pool.query('DELETE FROM notifications WHERE notification_id = ?', [notificationId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get notification by ID
  static async findById(notificationId) {
    try {
      const [rows] = await pool.query('SELECT * FROM notifications WHERE notification_id = ?', [notificationId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = NotificationModel;
