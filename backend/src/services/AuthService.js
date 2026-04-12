const UserModel = require('../models/UserModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { ConflictError, AuthError, NotFoundError } = require('../exceptions/AppError');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../constants/messages');

class AuthService {
  static async register(userData) {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USER_EXISTS);
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user
    const userId = await UserModel.create({
      ...userData,
      password_hash,
    });

    // Generate token
    const token = generateToken(userId, userData.email, 'member');

    return {
      userId,
      username: userData.username,
      email: userData.email,
      token,
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    };
  }

  static async login(email, password) {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AuthError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AuthError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = generateToken(user.user_id, user.email, user.role);

    return {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    };
  }
}

module.exports = AuthService;
