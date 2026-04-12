const UserModel = require('../models/UserModel');
const { NotFoundError } = require('../exceptions/AppError');

class UserService {
  static async deleteUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await UserModel.delete(userId);
    return true;
  }
  static async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async getAllUsers(page, limit) {
    const offset = (page - 1) * limit;
    const result = await UserModel.getAll(limit, offset);
    return result;
  }

  static async updateUserProfile(userId, updateData) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await UserModel.update(userId, updateData);
    return true;
  }

  static async uploadProfileImage(userId, imageUrl) {
    try {
      console.log('UserService.uploadProfileImage called:', { userId, imageUrl });
      
      const user = await UserModel.findById(userId);
      console.log('User found in DB:', user);
      
      if (!user) {
        console.warn('User not found by userId:', userId);
        throw new NotFoundError('User not found');
      }
      
      console.log('Calling UserModel.updateProfileImage...');
      const updatedUser = await UserModel.updateProfileImage(userId, imageUrl);
      console.log('UserModel.updateProfileImage returned:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('UserService.uploadProfileImage error:', {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = UserService;
