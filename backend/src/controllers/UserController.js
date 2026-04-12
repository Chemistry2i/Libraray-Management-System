const UserService = require('../services/UserService');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');
const config = require('../config/config');

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

  static async uploadProfileImage(req, res, next) {
    try {
      console.log('uploadProfileImage called');
      console.log('req.file:', req.file);
      console.log('req.user:', req.user);

      if (!req.file) {
        console.warn('No file in upload request');
        return sendSuccess(res, 'No file uploaded', null, 400);
      }

      if (!req.user || !req.user.user_id) {
        console.warn('No user in request or user_id missing');
        return sendSuccess(res, 'User not authenticated', null, 401);
      }

      const userId = req.user.user_id;
      const imageUrl = `${config.API_URL}/uploads/profile-images/${req.file.filename}`;

      console.log('Uploading image for userId:', userId);
      console.log('Image filename:', req.file.filename);
      console.log('Image URL:', imageUrl);

      // Update user profile with image URL
      const updatedUser = await UserService.uploadProfileImage(userId, imageUrl);
      
      if (!updatedUser) {
        console.warn('User not found during image upload:', userId);
        return sendSuccess(res, 'User not found', null, 404);
      }

      console.log('Profile image uploaded successfully for userId:', userId);
      console.log('Sending response with user:', updatedUser);
      console.log('Sending imageUrl:', imageUrl);
      
      const responseData = {
        success: true,
        message: 'Profile image uploaded successfully',
        data: { 
          user: updatedUser,
          imageUrl 
        },
        timestamp: new Date().toISOString()
      };
      
      console.log('Before sending success response');
      console.log('Response object:', JSON.stringify(responseData, null, 2));
      res.status(200).json(responseData);
      console.log('After sending success response - response sent');
    } catch (error) {
      console.error('Upload profile image error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        type: error.constructor.name
      });
      
      // Only send error response if headers not already sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: error.message || 'Image upload failed',
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('Headers already sent, cannot send error response');
      }
    }
  }
}

module.exports = UserController;
