const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { registerValidator, loginValidator, passwordValidator } = require('../validators/validators');

// Public Routes
router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', passwordValidator, AuthController.resetPassword);
router.post('/refresh', AuthController.refreshToken);

// Protected Routes
router.get('/me', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, passwordValidator, AuthController.changePassword);

module.exports = router;
