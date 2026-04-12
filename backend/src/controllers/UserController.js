const UserService = require('../services/UserService');
const UserModel = require('../models/UserModel');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');
const config = require('../config/config');
const { hashPassword } = require('../services/PasswordService');
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
    // existing upload code
    try {
      if (!req.file) return sendSuccess(res, 'No file uploaded', null, 400);
      if (!req.user || !req.user.user_id) return sendSuccess(res, 'User not authenticated', null, 401);

      const userId = req.user.user_id;
      const imageUrl = `${config.API_URL}/uploads/profile-images/${req.file.filename}`;
      const updatedUser = await UserService.uploadProfileImage(userId, imageUrl);
      
      if (!updatedUser) return sendSuccess(res, 'User not found', null, 404);
      
      res.status(200).json({ success: true, message: 'Profile image uploaded successfully', data: { user: updatedUser, imageUrl }, timestamp: new Date().toISOString() });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message || 'Image upload failed', timestamp: new Date().toISOString() });
      }
    }
  }
}

module.exports = UserController;
