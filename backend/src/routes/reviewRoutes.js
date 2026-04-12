const express = require('express');
const router = express.Router({ mergeParams: true });
const ReviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middleware/auth');
const { reviewValidator } = require('../validators/validators');

// Public route - get all reviews for a book
router.get('/', ReviewController.getBookReviews);

// Protected routes
router.post('/', authenticate, reviewValidator, ReviewController.createReview);
router.put('/:reviewId', authenticate, reviewValidator, ReviewController.updateReview);
router.delete('/:reviewId', authenticate, ReviewController.deleteReview);

module.exports = router;

const { ROLES } = require('../constants/appConstants');
const { authorize } = require('../middleware/auth');

// Admin routes
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.getAllReviews);
router.delete('/admin/:reviewId', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.adminDeleteReview);
