const UserService = require('../services/UserService');
const UserModel = require('../models/UserModel');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');
const fs = require('fs');
const { hashPassword } = require('../services/PasswordService');
const ProfileImageStorageService = require('../services/ProfileImageStorageService');
const { NotFoundError, ConflictError } = require('../exceptions/AppError');

class UserController {
  static async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      sendSuccess(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getUserProfile(req.user.user_id);
      sendSuccess(res, 'Profile retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      
      const { users, total } = await UserService.getAllUsers(page, limit);
      sendPaginated(res, 'Users retrieved', users, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req, res, next) {
    try {
      const user = await UserService.getUserProfile(req.params.id);
      sendSuccess(res, 'User retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      await UserService.updateUserProfile(req.user.user_id, req.body);
      sendSuccess(res, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  // Admin: Update User
  static async updateUser(req, res, next) {
    try {
      const db = require('../config/database');
      const { first_name, last_name, email, role, phone_number, username, status } = req.body;
      
      // Update logic
      const [result] = await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = COALESCE(?, role), phone = COALESCE(?, phone), username = COALESCE(?, username), status = COALESCE(?, status) WHERE user_id = ?',
        [first_name, last_name, email, role, phone_number, username, status, req.params.id]
      );
      if (result.affectedRows === 0) throw new NotFoundError('User not found');
      sendSuccess(res, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create User
  static async createUser(req, res, next) {
    try {
      const db = require('../config/database');
      const { first_name, last_name, email, role, password, username, phone_number, status } = req.body;
      
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) throw new ConflictError('User with this email already exists');
      
      const pass = password || 'Library123!';
      const password_hash = await hashPassword(pass);
      const userStatus = status || 'active';
      const uname = username || email.split('@')[0];
      
      const [result] = await db.query(
        'INSERT INTO users (first_name, last_name, email, role, password_hash, username, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, role || 'member', password_hash, uname, phone_number, userStatus]
      );
      sendSuccess(res, 'User created successfully', { user_id: result.insertId }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfileImage(req, res, next) {
    let imageUrl;
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Select a profile image first' });
      if (!req.user || !req.user.user_id) return res.status(401).json({ success: false, message: 'User not authenticated' });

      const userId = req.params.id || req.user.user_id;
      imageUrl = await ProfileImageStorageService.store(req.file);
      const updatedUser = await UserService.uploadProfileImage(userId, imageUrl);
      
      if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
      
      sendSuccess(res, 'Profile image uploaded successfully', { user: updatedUser, imageUrl });
    } catch (error) {
      next(error);
    } finally {
      if (req.file?.path && ProfileImageStorageService.shouldRemoveTemporaryFile()) {
        try {
          await fs.promises.rm(req.file.path, { force: true });
        } catch (error) {
          console.error('Could not remove temporary profile image:', error.message);
        }
      }
    }
  }
}

module.exports = UserController;
