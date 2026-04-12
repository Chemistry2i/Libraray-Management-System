const fs = require('fs');

// Patch ReviewController
const rcPath = 'backend/src/controllers/ReviewController.js';
let rc = fs.readFileSync(rcPath, 'utf8');

const adminReviewsStr = `
  // Admin: Get all reviews
  static async getAllReviews(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page - 1) * limit;
      
      const pool = require('../config/database');
      const [rows] = await pool.query(
        \`SELECT r.*, u.username, u.email, b.title 
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         JOIN books b ON r.book_id = b.book_id
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?\`, [limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM reviews');
      
      // Let's manually return the response like the sendSuccess utility
      res.status(200).json({ status: 'success', message: 'Reviews retrieved', data: { reviews: rows, total: count[0].total } });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete review
  static async adminDeleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const pool = require('../config/database');
      await pool.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);
      res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
`;

if (!rc.includes('getAllReviews')) {
  rc = rc.replace('class ReviewController {', 'class ReviewController {' + adminReviewsStr);
  fs.writeFileSync(rcPath, rc);
}

// Patch reviewRoutes
const rrPath = 'backend/src/routes/reviewRoutes.js';
let rr = fs.readFileSync(rrPath, 'utf8');

const rrAdminStr = `
const { ROLES } = require('../constants/appConstants');
const { authorize } = require('../middleware/auth');

// Admin routes
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.getAllReviews);
router.delete('/admin/:reviewId', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReviewController.adminDeleteReview);
`;

if (!rr.includes('/admin/all')) {
  rr += rrAdminStr;
  fs.writeFileSync(rrPath, rr);
}

console.log("Reviews backend complete");
