const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class ReviewModel {
  // Create review
  static async create(reviewData) {
    try {
      const { book_id, user_id, rating, comment } = reviewData;
      const [result] = await pool.query(
        'INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [book_id, user_id, rating, comment]
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get reviews for book
  static async findByBookId(bookId) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.username FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         WHERE r.book_id = ?
         ORDER BY r.created_at DESC`,
        [bookId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get average rating for book
  static async getAverageRating(bookId) {
    try {
      const [rows] = await pool.query(
        'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE book_id = ?',
        [bookId]
      );
      return rows[0];
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get user's review for a book
  static async findUserReview(userId, bookId) {
    try {
      const [rows] = await pool.query('SELECT * FROM reviews WHERE user_id = ? AND book_id = ?', [userId, bookId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Update review
  static async update(reviewId, updateData) {
    try {
      const { rating, comment } = updateData;
      await pool.query('UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?', [rating, comment, reviewId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Delete review
  static async delete(reviewId) {
    try {
      await pool.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get review by ID
  static async findById(reviewId) {
    try {
      const [rows] = await pool.query('SELECT * FROM reviews WHERE review_id = ?', [reviewId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Mark helpful
  static async incrementHelpful(reviewId) {
    try {
      await pool.query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = ?', [reviewId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = ReviewModel;
