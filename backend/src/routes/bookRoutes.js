// ...existing code...
const express = require('express');
const router = express.Router();
const BookController = require('../controllers/BookController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for book uploads
const bookUploadDirectory = path.join(__dirname, '../../uploads/books');
fs.mkdirSync(bookUploadDirectory, { recursive: true });
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, bookUploadDirectory);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
		cb(null, uniqueName);
	}
});
const upload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024, files: 2 },
	fileFilter: (req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		if (file.fieldname === 'cover') {
			const validCover = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)
				&& ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
			return callback(validCover ? null : new Error('Book cover must be a JPEG, PNG, or WebP image'));
		}
		callback(null, true);
	},
});
// Minimal test route for multer file upload debugging
router.post('/test-upload', upload.fields([
	{ name: 'cover', maxCount: 1 },
	{ name: 'book_file', maxCount: 1 }
]), (req, res) => {
	console.log('TEST req.files:', req.files);
	console.log('TEST req.body:', req.body);
	res.json({ files: req.files, body: req.body });
});
const { authenticate, authorize } = require('../middleware/auth');
const { bookValidator } = require('../validators/validators');
const { ROLES } = require('../constants/appConstants');

// Public Routes
router.get('/', BookController.getBooks);
router.get('/search', BookController.searchBooks);
router.get('/:id', BookController.getBook);

// Protected Routes (Librarian+)
router.post(
	'/',
	authenticate,
	authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
	upload.fields([
		{ name: 'cover', maxCount: 1 },
		{ name: 'book_file', maxCount: 1 }
	]),
	bookValidator,
	BookController.createBook
);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), upload.fields([{ name: 'cover', maxCount: 1 }]), bookValidator, BookController.updateBook);

// Download book file
router.get('/:id/download', BookController.downloadBook);

// Protected Routes (Admin only)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN,ROLES.LIBRARIAN), BookController.deleteBook);

module.exports = router;
