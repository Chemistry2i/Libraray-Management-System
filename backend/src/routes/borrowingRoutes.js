const express = require('express');
const router = express.Router();
const BorrowingController = require('../controllers/BorrowingController');
const { authenticate, authorize } = require('../middleware/auth');
const { renewValidator, payFineValidator } = require('../validators/validators');

// ===== USER ROUTES (Protected) =====

// Request to borrow a book (replaces direct checkout)
router.post('/request', authenticate, BorrowingController.requestBorrow);

// Legacy checkout (redirects to request for compatibility)
router.post('/checkout', authenticate, BorrowingController.checkout);

// User borrowing operations
router.post('/return', authenticate, BorrowingController.returnBook);
router.get('/my-books', authenticate, BorrowingController.getActiveBooks);
router.get('/history', authenticate, BorrowingController.getHistory);
router.post('/renew', authenticate, renewValidator, BorrowingController.renewBook);
router.post('/:borrowId/pay-fine', authenticate, payFineValidator, BorrowingController.payFine);
router.get('/stats/user/:userId', authenticate, BorrowingController.getUserBorrowingStats);

// ===== ADMIN/LIBRARIAN ROUTES (Protected + Role Check) =====

// Approval workflow (librarian only)
router.post('/:borrowId/approve', authenticate, authorize('librarian', 'admin'), BorrowingController.approveBorrow);
router.post('/:borrowId/reject', authenticate, authorize('librarian', 'admin'), BorrowingController.rejectBorrow);

// Admin management view (librarian only)
router.get('/admin/pending-requests', authenticate, authorize('librarian', 'admin'), BorrowingController.getPendingRequests);
router.get('/admin/active', authenticate, authorize('librarian', 'admin'), BorrowingController.getAllActiveBorrowings);
router.get('/admin/overdue', authenticate, authorize('librarian', 'admin'), BorrowingController.getOverdueBooks);
router.get('/admin/statistics', authenticate, authorize('librarian', 'admin'), BorrowingController.getBorrowingStats);

module.exports = router;
