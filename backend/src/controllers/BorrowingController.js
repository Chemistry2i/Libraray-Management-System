const BorrowingService = require('../services/BorrowingService');
const BorrowingModel = require('../models/BorrowingModel');
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

      const { records, total } = await BorrowingService.getAllActiveBorrowings(page, limit, { userId, bookId });
      sendPaginated(res, 'All active borrowings', records, page, limit, total);
    } catch (error) {
      next(error);
    }
  }
  
  // Get all borrowings including returned (admin overview view)
  static async getAllBorrowings(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const offset = (page - 1) * limit;
      
      const pool = require('../config/database');
      const [records] = await pool.query(
        `SELECT br.*, b.title, b.author, u.username, u.email, u.first_name, u.last_name
         FROM borrowing_records br
         JOIN books b ON br.book_id = b.book_id
         JOIN users u ON br.user_id = u.user_id
         ORDER BY br.borrow_id DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM borrowing_records');
      
      sendPaginated(res, 'All borrowings retrieved', records, page, limit, countResult[0].total);
    } catch (error) {
      next(error);
    }
  }
  
  // Admin forced book return
  static async adminReturnBook(req, res, next) {
    try {
      const { borrowId } = req.params;
      const pool = require('../config/database');
      
      // Get borrowing record
      const [records] = await pool.query('SELECT * FROM borrowing_records WHERE borrow_id = ?', [borrowId]);
      if (records.length === 0) throw new Error('Borrowing record not found');
      
      const record = records[0];
      if (record.status === 'returned') throw new Error('Book is already returned.');

      let fine = 0;
      const today = new Date();
      const dueDate = new Date(record.due_date);
      if (today > dueDate) {
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        fine = daysOverdue * 10; // $10 per day? That's what returnBook calculates
      }

      await pool.query(
        'UPDATE borrowing_records SET return_date = ?, status = ?, fine_amount = ? WHERE borrow_id = ?',
        [today.toISOString().split('T')[0], 'returned', fine, borrowId]
      );
      
      // Update book copies
      if (record.copy_id) {
        await pool.query('UPDATE book_copies SET status = "available" WHERE copy_id = ?', [record.copy_id]);
      } else {
        await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?', [record.book_id]);
      }
      
      sendSuccess(res, 'Book returned successfully by admin', { fine });
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
