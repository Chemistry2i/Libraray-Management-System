const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../exceptions/AppError');

// Validation handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Auth Validators
const registerValidator = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  handleValidationErrors,
];

const loginValidator = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Book Validators
const requireBookFiles = (req, res, next) => {
  // Only enforce on create (POST)
  console.log('DEBUG: requireBookFiles req.method:', req.method);
  console.log('DEBUG: requireBookFiles req.files:', req.files);
  if (req.method === 'POST') {
    if (!req.files || !req.files.cover || !req.files.book_file) {
      console.log('DEBUG: requireBookFiles missing files:', req.files);
      return res.status(400).json({
        success: false,
        message: 'Cover image and book file are required',
      });
    }
  }
  next();
};

const bookValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').optional().trim(),
  body('publication_year').optional().isInt(),
  requireBookFiles,
  handleValidationErrors,
];

// Category Validators (Greenstone-inspired: rich metadata support)
const categoryValidator = [
  body('category_name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  handleValidationErrors,
];

// Reservation Validators (KYU Space-inspired: resource discovery)
const reservationValidator = [
  body('bookId').notEmpty().withMessage('Book ID is required').isInt().withMessage('Book ID must be a number'),
  handleValidationErrors,
];

// Password Validators (for change/reset password)
const passwordValidator = [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('currentPassword').optional().isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  handleValidationErrors,
];

// Renewal Validator
const renewValidator = [
  body('borrowId').notEmpty().withMessage('Borrow ID is required').isInt().withMessage('Borrow ID must be a number'),
  handleValidationErrors,
];

// Payment Validator
const payFineValidator = [
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  handleValidationErrors,
];

// Review Validator
const reviewValidator = [
  body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  bookValidator,
  categoryValidator,
  reservationValidator,
  passwordValidator,
  renewValidator,
  payFineValidator,
  reviewValidator,
};
