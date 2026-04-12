const AuthService = require('../services/AuthService');
const PasswordService = require('../services/PasswordService');
const UserModel = require('../models/UserModel');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants/messages');

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result.message, { token: result.token, userId: result.userId }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      sendSuccess(res, result.message, { token: result.token, userId: result.userId });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.user_id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, 'Profile retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  // Logout - add token to blacklist
  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userId = req.user.user_id;

      const result = await PasswordService.logout(token, userId);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Change password (when logged in)
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.user_id;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendError(res, 'All fields are required', 400);
      }

      if (newPassword !== confirmPassword) {
        return sendError(res, 'Passwords do not match', 400);
      }

      await PasswordService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, SUCCESS_MESSAGES.PASSWORD_CHANGED);
    } catch (error) {
      next(error);
    }
  }

  // Forgot password - send reset email
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendError(res, 'Email is required', 400);
      }

      const result = await PasswordService.forgotPassword(email);
      // Don't expose the token in production - only for testing
      sendSuccess(res, result.message, { testToken: result.testToken });
    } catch (error) {
      next(error);
    }
  }

  // Reset password with token
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return sendError(res, 'All fields are required', 400);
      }

      const result = await PasswordService.resetPassword(token, newPassword, confirmPassword);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  static async refreshToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return sendError(res, 'Token is required', 400);
      }

      const result = await PasswordService.refreshToken(token);
      sendSuccess(res, 'Token refreshed', { token: result.token, expiresIn: result.expiresIn });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
