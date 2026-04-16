const express = require('express');
const router = express.Router({ mergeParams: true });
const ReviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middleware/auth');
const { reviewValidator } = require('../validators/validators');
const { ROLES } = require('../constants/appConstants');
const { authorize } = require('../middleware/auth');

// Public route - get all reviews for a book
router.get('/', ReviewController.getBookReviews);

// Protected routes
router.get('/my-reviews', authenticate, ReviewController.getUserReviews);
router.post('/', authenticate, reviewValidator, ReviewController.createReview);
router.put('/:reviewId', authenticate, reviewValidator, ReviewController.updateReview);
router.delete('/:reviewId', authenticate, ReviewController.deleteReview);

// Admin routes
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.getAllReviews);
router.delete('/admin/:reviewId', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.adminDeleteReview);

module.exports = router;
