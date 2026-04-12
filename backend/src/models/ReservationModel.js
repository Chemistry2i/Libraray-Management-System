const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class ReservationModel {
  // Create reservation
  static async create(reservationData) {
    try {
      const { user_id, book_id } = reservationData;
      const [result] = await pool.query(
        'INSERT INTO reservations (user_id, book_id, status) VALUES (?, ?, ?)',
        [user_id, book_id, 'pending']
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get user reservations
  static async findByUserId(userId, limit, offset) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, b.title, b.author, b.available_copies
         FROM reservations r
         JOIN books b ON r.book_id = b.book_id
         WHERE r.user_id = ?
         ORDER BY r.reservation_date DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM reservations WHERE user_id = ?', [userId]);
      return { reservations: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get all reservations (for admin/librarian)
  static async findAll(limit, offset) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, b.title, u.email, u.username
         FROM reservations r
         JOIN books b ON r.book_id = b.book_id
         JOIN users u ON r.user_id = u.user_id
         ORDER BY r.reservation_date DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM reservations');
      return { reservations: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get reservation by ID
  static async findById(reservationId) {
    try {
      const [rows] = await pool.query('SELECT * FROM reservations WHERE reservation_id = ?', [reservationId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get pending reservations for a book (queue management - Greenstone inspired)
  static async getPendingReservationsForBook(bookId) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.email, u.username, u.phone
         FROM reservations r
         JOIN users u ON r.user_id = u.user_id
         WHERE r.book_id = ? AND r.status = 'pending'
         ORDER BY r.reservation_date ASC`,
        [bookId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Update reservation status
  static async updateStatus(reservationId, status) {
    try {
      await pool.query('UPDATE reservations SET status = ? WHERE reservation_id = ?', [status, reservationId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Cancel reservation
  static async cancel(reservationId) {
    try {
      await pool.query('UPDATE reservations SET status = ? WHERE reservation_id = ?', ['cancelled', reservationId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Check if user already reserved book
  static async hasExistingReservation(userId, bookId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM reservations WHERE user_id = ? AND book_id = ? AND status IN (?, ?)',
        [userId, bookId, 'pending', 'ready']
      );
      return rows.length > 0;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get reservation queue position (Greenstone-inspired: resource discovery)
  static async getQueuePosition(reservationId) {
    try {
      const [reservation] = await pool.query('SELECT book_id FROM reservations WHERE reservation_id = ?', [
        reservationId,
      ]);

      if (reservation.length === 0) return null;

      const [position] = await pool.query(
        `SELECT COUNT(*) + 1 as position
         FROM reservations
         WHERE book_id = ? AND reservation_date <= (SELECT reservation_date FROM reservations WHERE reservation_id = ?)
         AND status IN ('pending', 'ready')`,
        [reservation[0].book_id, reservationId]
      );

      return position[0].position;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = ReservationModel;
