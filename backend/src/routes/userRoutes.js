const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserController = require('../controllers/UserController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/appConstants');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile image uploads
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.userId || 'unknown';
    const uniqueName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE' || err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size must be less than 5MB', code: 'FILE_TOO_LARGE' });
    }
    return res.status(400).json({ success: false, message: err.message || 'File upload error', code: err.code });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  next();
};

// Protected Routes
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);

// Log upload route hits BEFORE authentication
router.post('/profile/image', authenticate, 
  uploadProfileImage.single('profileImage'), 
  handleMulterError, 
  UserController.uploadProfileImage
);

// Admin & Librarian Routes
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), UserController.getAllUsers);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), UserController.createUser);
router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), UserController.getUser);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), UserController.updateUser);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), UserController.deleteUser);

module.exports = router;
