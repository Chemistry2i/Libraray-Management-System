const UserModel = require('../models/UserModel');
const TokenBlacklistModel = require('../models/TokenBlacklistModel');
const NotificationModel = require('../models/NotificationModel');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../utils/helpers');
const { AuthError, NotFoundError, ValidationError } = require('../exceptions/AppError');
const pool = require('../config/database');

class PasswordService {
  // Change password (when user is logged in)
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isValid = await comparePassword(currentPassword, user.password_hash);
      if (!isValid) {
        throw new AuthError('Current password is incorrect');
      }

      // Check if new password is different
      if (currentPassword === newPassword) {
        throw new ValidationError('New password must be different from current password');
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);

      // Create notification
      await NotificationModel.create({
        user_id: userId,
        type: 'security',
        title: 'Password Changed',
        message: 'Your password was successfully changed. If this was not you, please contact support.',
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Initiate password reset - generate token and send email
  static async forgotPassword(email) {
    try {
      // Check if user exists
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new NotFoundError('Email not found in our system');
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = generateToken({ userId: user.user_id, type: 'reset' }, '1h');

      // Store reset token in database (you might want a separate table for this)
      // For now, we'll store it temporarily
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour
      await pool.query(
        'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reset_token = ?, expires_at = ?',
        [user.user_id, resetToken, expiresAt, resetToken, expiresAt]
      );

      // Send email (implementation would go here)
      // For now just log it
      console.log(`Reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);

      return {
        message: 'Reset link sent to email',
        // For testing purposes only - remove in production
        testToken: resetToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password using token
  static async resetPassword(resetToken, newPassword, confirmPassword) {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new ValidationError('Passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }

      // Verify token
      let decoded;
      try {
        decoded = verifyToken(resetToken);
      } catch (err) {
        throw new AuthError('Reset token is invalid or expired');
      }

      if (decoded.type !== 'reset') {
        throw new AuthError('Invalid reset token');
      }

      // Get reset record
      const [resetRecords] = await pool.query(
        'SELECT * FROM password_resets WHERE user_id = ? AND reset_token = ? AND expires_at > NOW()',
        [decoded.userId, resetToken]
      );

      if (resetRecords.length === 0) {
        throw new AuthError('Reset token is invalid or expired');
      }

      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, decoded.userId]);

      // Delete reset token
      await pool.query('DELETE FROM password_resets WHERE user_id = ?', [decoded.userId]);

      // Create notification
      await NotificationModel.create({
        user_id: decoded.userId,
        type: 'security',
        title: 'Password Reset',
        message: 'Your password has been successfully reset.',
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Refresh token (get new token with extended expiry)
  static async refreshToken(currentToken) {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklistModel.isTokenBlacklisted(currentToken);
      if (isBlacklisted) {
        throw new AuthError('Session expired. Please login again.');
      }

      // Verify token (allow some grace period)
      let decoded;
      try {
        decoded = verifyToken(currentToken);
      } catch (err) {
        throw new AuthError('Invalid token');
      }

      // Generate new token
      const newToken = generateToken(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
        '7d'
      );

      return {
        token: newToken,
        expiresIn: '7 days',
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout - add token to blacklist
  static async logout(token, userId) {
    try {
      // Verify token to get expiry
      const decoded = verifyToken(token);
      const expiresAt = new Date(decoded.exp * 1000); // Convert from seconds

      // Add to blacklist
      await TokenBlacklistModel.blacklistToken(token, userId, expiresAt);

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PasswordService;
