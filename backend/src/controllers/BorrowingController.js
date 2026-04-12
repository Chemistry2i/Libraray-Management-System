const BorrowingService = require('../services/BorrowingService');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');

class BorrowingController {
  // ===== USER ENDPOINTS =====

  // Request to borrow a book
  static async requestBorrow(req, res, next) {
    try {
      const { bookId } = req.body;
      const borrowId = await BorrowingService.requestBook(req.user.user_id, bookId);
      sendSuccess(res, 'Borrow request submitted for approval', { borrowId }, 201);
    } catch (error) {
      next(error);
    }
  }

  // Legacy checkout endpoint (redirects to request)
  static async checkout(req, res, next) {
    return this.requestBorrow(req, res, next);
  }

  static async returnBook(req, res, next) {
    try {
      const { borrowId } = req.body;
      const fine = await BorrowingService.returnBook(borrowId, req.user.user_id);
      sendSuccess(res, 'Book returned', { fine });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveBooks(req, res, next) {
    try {
      const books = await BorrowingService.getActiveBooks(req.user.user_id);
      sendSuccess(res, 'Active borrowings', { books });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      
      const { records, total } = await BorrowingService.getHistory(req.user.user_id, page, limit);
      sendPaginated(res, 'Borrowing history', records, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  // Renew book (extend due date)
  static async renewBook(req, res, next) {
    try {
      const { borrowId } = req.body;
      const userId = req.user.user_id;

      const result = await BorrowingService.renewBook(borrowId, userId);
      sendSuccess(res, 'Book renewed successfully', { newDueDate: result.newDueDate });
    } catch (error) {
      next(error);
    }
  }

  // Pay fine
  static async payFine(req, res, next) {
    try {
      const { borrowId } = req.params;
      const { amount } = req.body;
      const userId = req.user.user_id;

      const receipt = await BorrowingService.payFine(borrowId, userId, amount);
      sendSuccess(res, 'Fine paid successfully', { receipt }, 201);
    } catch (error) {
      next(error);
    }
  }

  // ===== APPROVAL WORKFLOW ENDPOINTS =====

  // Approve borrow request (admin/librarian)
  static async approveBorrow(req, res, next) {
    try {
      const { borrowId } = req.params;
      const approvedByUserId = req.user.user_id;

      const result = await BorrowingService.approveBorrow(borrowId, approvedByUserId);
      sendSuccess(res, 'Borrow request approved', result);
    } catch (error) {
      next(error);
    }
  }

  // Reject borrow request (admin/librarian)
  static async rejectBorrow(req, res, next) {
    try {
      const { borrowId } = req.params;
      const { reason } = req.body;
      const approvedByUserId = req.user.user_id;

      const result = await BorrowingService.rejectBorrow(borrowId, approvedByUserId, reason);
      sendSuccess(res, 'Borrow request rejected', result);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN/LIBRARIAN ENDPOINTS =====

  // Get pending borrow requests
  static async getPendingRequests(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const userId = req.query.userId ? parseInt(req.query.userId) : null;

      const { records, total } = await BorrowingService.getPendingRequests(
        page,
        limit,
        { userId }
      );

      sendPaginated(
        res,
        'Pending borrow requests',
        records,
        page,
        limit,
        total
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all active borrowings (admin view)
  static async getAllActiveBorrowings(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      const bookId = req.query.bookId ? parseInt(req.query.bookId) : null;

      const { records, total } = await BorrowingService.getAllActiveBorrowings(
        page,
        limit,
        { userId, bookId }
      );

      sendPaginated(
        res,
        'All active borrowings',
        records,
        page,
        limit,
        total
      );
    } catch (error) {
      next(error);
    }
  }

  // Get overdue books
  static async getOverdueBooks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;

      const { records, total } = await BorrowingService.getOverdueBooks(
        page,
        limit
      );

      sendPaginated(
        res,
        'Overdue books',
        records,
        page,
        limit,
        total
      );
    } catch (error) {
      next(error);
    }
  }

  // Get borrowing system statistics
  static async getBorrowingStats(req, res, next) {
    try {
      const stats = await BorrowingService.getBorrowingStats();
      sendSuccess(res, 'Borrowing statistics', { stats });
    } catch (error) {
      next(error);
    }
  }

  // Get user borrowing statistics
  static async getUserBorrowingStats(req, res, next) {
    try {
      const userId = req.params.userId || req.user.user_id;
      const stats = await BorrowingService.getUserBorrowingStats(userId);
      sendSuccess(res, 'User borrowing statistics', { stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BorrowingController;
