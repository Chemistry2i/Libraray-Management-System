const database = require('../config/database');
const pool = database.pool;

class WaitlistModel {
  // Add to waitlist
  static async addToWaitlist(userId, bookId) {
    try {
      const [existing] = await pool.query(
        'SELECT * FROM waitlist WHERE user_id = ? AND book_id = ? AND status = "waiting"',
        [userId, bookId]
      );

      if (existing.length > 0) {
        throw new Error('Already on waitlist for this book');
      }

      const [result] = await pool.query(
        'INSERT INTO waitlist (user_id, book_id, status, created_at) VALUES (?, ?, "waiting", NOW())',
        [userId, bookId]
      );

      return {
        success: true,
        message: 'Added to waitlist',
        data: { waitlist_id: result.insertId }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get waitlist for a book
  static async getBookWaitlist(bookId) {
    try {
      const [waitlist] = await pool.query(`
        SELECT w.*, u.username, u.email
        FROM waitlist w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.book_id = ? AND w.status = 'waiting'
        ORDER BY w.created_at ASC
      `, [bookId]);

      return waitlist;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Notify next person in waitlist
  static async notifyNextWaitlisted(bookId) {
    try {
      const [waitlist] = await pool.query(`
        SELECT w.*, u.email, u.username
        FROM waitlist w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.book_id = ? AND w.status = 'waiting'
        ORDER BY w.created_at ASC
        LIMIT 1
      `, [bookId]);

      if (waitlist.length === 0) {
        return null;
      }

      const nextInLine = waitlist[0];

      // Update status to notified
      await pool.query(
        'UPDATE waitlist SET status = "notified", notified_at = NOW() WHERE waitlist_id = ?',
        [nextInLine.waitlist_id]
      );

      return nextInLine;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Remove from waitlist
  static async removeFromWaitlist(userId, bookId) {
    try {
      await pool.query(
        'DELETE FROM waitlist WHERE user_id = ? AND book_id = ?',
        [userId, bookId]
      );
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get user's waitlist
  static async getUserWaitlist(userId) {
    try {
      const [waitlist] = await pool.query(`
        SELECT w.*, b.title, b.author, b.cover_url
        FROM waitlist w
        JOIN books b ON w.book_id = b.book_id
        WHERE w.user_id = ? AND w.status IN ('waiting', 'notified')
        ORDER BY w.created_at ASC
      `, [userId]);

      return waitlist;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = WaitlistModel;
