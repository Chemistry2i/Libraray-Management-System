const ReviewModel = require('../models/ReviewModel');
const BorrowingModel = require('../models/BorrowingModel');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ValidationError } = require('../exceptions/AppError');

class ReviewController {
  // Get all reviews for a book
  static async getBookReviews(req, res, next) {
    try {
      const { bookId } = req.params;

      const reviews = await ReviewModel.findByBookId(bookId);
      const ratingStats = await ReviewModel.getAverageRating(bookId);

      sendSuccess(res, 'Book reviews retrieved', {
        reviews,
        stats: {
          averageRating: ratingStats.average_rating || 0,
          totalReviews: ratingStats.total_reviews || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create review for a book (only if user borrowed it)
  static async createReview(req, res, next) {
    try {
      const { bookId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.user_id;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5');
      }

      // Check if user has borrowed this book
      const borrowedBooks = await BorrowingModel.getUserBorrowedBooks(userId, bookId);
      if (!borrowedBooks || borrowedBooks.length === 0) {
        throw new ValidationError('You can only review books you have borrowed');
      }

      // Check if user already reviewed this book
      const existingReview = await ReviewModel.findUserReview(userId, bookId);
      if (existingReview) {
        throw new ValidationError('You have already reviewed this book');
      }

      const reviewData = {
        book_id: bookId,
        user_id: userId,
        rating,
        comment: comment || null,
      };

      const reviewId = await ReviewModel.create(reviewData);

      sendSuccess(
        res,
        'Review created successfully',
        {
          reviewId,
          rating,
          comment,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update review (only own reviews)
  static async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.user_id;

      // Validate rating
      if (rating && (rating < 1 || rating > 5)) {
        throw new ValidationError('Rating must be between 1 and 5');
      }

      // Verify ownership
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.user_id !== userId) {
        throw new Error('Unauthorized: Cannot update other user reviews');
      }

      await ReviewModel.update(reviewId, { rating, comment });

      sendSuccess(res, 'Review updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete review (only own reviews)
  static async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.user_id;

      // Verify ownership
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.user_id !== userId) {
        throw new Error('Unauthorized: Cannot delete other user reviews');
      }

      await ReviewModel.delete(reviewId);

      sendSuccess(res, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
