const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class TokenBlacklistModel {
  // Add token to blacklist (on logout)
  static async blacklistToken(token, userId, expiresAt) {
    try {
      const [result] = await pool.query(
        'INSERT INTO token_blacklist (token, user_id, blacklisted_at, expires_at) VALUES (?, ?, NOW(), ?)',
        [token, userId, expiresAt]
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Check if token is blacklisted
  static async isTokenBlacklisted(token) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM token_blacklist WHERE token = ? AND expires_at > NOW()',
        [token]
      );
      return rows.length > 0;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Clean expired tokens
  static async cleanExpiredTokens() {
    try {
      await pool.query('DELETE FROM token_blacklist WHERE expires_at < NOW()');
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get all blacklisted tokens for user
  static async getUserBlacklistedTokens(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM token_blacklist WHERE user_id = ? AND expires_at > NOW()',
        [userId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = TokenBlacklistModel;
