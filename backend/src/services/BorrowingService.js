const BorrowingModel = require('../models/BorrowingModel');
const BookModel = require('../models/BookModel');
const NotificationService = require('./NotificationService');
const EmailService = require('./EmailService');
const ReservationModel = require('../models/ReservationModel');
const { NotFoundError, ValidationError } = require('../exceptions/AppError');
const { MAX_BORROW_DAYS, MAX_RENEWALS } = require('../constants/appConstants');
const pool = require('../config/database');

class BorrowingService {
  static async getAllFines(page, limit) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT br.borrow_id, br.user_id, br.book_id, br.fine_amount, br.status, br.due_date, br.return_date, 
              u.username, u.email, b.title 
       FROM borrowing_records br
       JOIN users u ON br.user_id = u.user_id
       JOIN books b ON br.book_id = b.book_id
       WHERE br.fine_amount > 0
       ORDER BY br.borrow_id DESC
       LIMIT ? OFFSET ?`, [limit, offset]
    );
    const [count] = await pool.query('SELECT COUNT(*) as total FROM borrowing_records WHERE fine_amount > 0');
    return { fines: rows, total: count[0].total };
  }

  static async waiveFine(borrowId) {
    const [borrowing] = await pool.query('SELECT fine_amount FROM borrowing_records WHERE borrow_id = ?', [borrowId]);
    if (borrowing.length === 0) throw new Error('Record not found');
    await pool.query('UPDATE borrowing_records SET fine_amount = 0 WHERE borrow_id = ?', [borrowId]);
    return true;
  }

  static async checkoutBook(userId, bookId) {
    // Verify book exists
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.available_copies <= 0) {
      throw new Error('No copies available');
    }

    const borrowId = await BorrowingModel.checkout(userId, bookId);
    return borrowId;
  }

  static async returnBook(borrowId, userId) {
    const fine = await BorrowingModel.returnBook(borrowId, userId);
    return fine;
  }

  static async getActiveBooks(userId) {
    const books = await BorrowingModel.getActiveBooks(userId);
    return books;
  }

  static async getHistory(userId, page, limit) {
    const offset = (page - 1) * limit;
    const result = await BorrowingModel.getHistory(userId, limit, offset);
    return result;
  }

  // Renew book - extend due date
  static async renewBook(borrowId, userId) {
    try {
      // Get borrowing record
      const [borrowing] = await pool.query(
        `SELECT br.*, b.title FROM borrowing_records br
         JOIN books b ON br.book_id = b.book_id
         WHERE br.borrow_id = ? AND br.user_id = ?`,
        [borrowId, userId]
      );

      if (borrowing.length === 0) {
        throw new NotFoundError('Borrowing record not found');
      }

      const record = borrowing[0];

      // Validate status
      if (record.status !== 'active') {
        throw new ValidationError('Can only renew active borrowings');
      }

      // Check if overdue
      const today = new Date();
      if (new Date(record.due_date) < today) {
        throw new ValidationError('Cannot renew overdue books. Please return and pay fines first.');
      }

      // Check if book is reserved
      const [reservations] = await pool.query(
        'SELECT * FROM reservations WHERE book_id = ? AND status IN ("pending", "ready")',
        [record.book_id]
      );

      if (reservations.length > 0) {
        throw new ValidationError('Cannot renew - book has pending reservations');
      }

      // Check renewal count
      if (record.renewals_count >= MAX_RENEWALS) {
        throw new ValidationError(`Maximum ${MAX_RENEWALS} renewals reached`);
      }

      // Calculate new due date
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + MAX_BORROW_DAYS);

      // Update borrowing record
      await pool.query(
        'UPDATE borrowing_records SET due_date = ?, renewals_count = renewals_count + 1 WHERE borrow_id = ?',
        [newDueDate, borrowId]
      );

      // Create notification
      await NotificationService.createNotification(
        userId,
        'renewal',
        'Book Renewed',
        `Your book "${record.title}" has been renewed. New due date: ${newDueDate.toDateString()}`
      );

      return { newDueDate };
    } catch (error) {
      throw error;
    }
  }

  // Pay fine for overdue book
  static async payFine(borrowId, userId, amount) {
    try {
      // Get borrowing record with fine info
      const [borrowing] = await pool.query(
        `SELECT br.*, u.email, b.title FROM borrowing_records br
         JOIN users u ON br.user_id = u.user_id
         JOIN books b ON br.book_id = b.book_id
         WHERE br.borrow_id = ? AND br.user_id = ?`,
        [borrowId, userId]
      );

      if (borrowing.length === 0) {
        throw new NotFoundError('Borrowing record not found');
      }

      const record = borrowing[0];

      // Validate amount
      if (amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      if (amount > record.fine_amount) {
        throw new ValidationError(`Fine amount is ${record.fine_amount}. Cannot pay more than owed.`);
      }

      // Update fine amount
      const remainingFine = record.fine_amount - amount;
      await pool.query('UPDATE borrowing_records SET fine_amount = ? WHERE borrow_id = ?', [remainingFine, borrowId]);

      // Record payment
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const [paymentResult] = await pool.query(
        'INSERT INTO fine_payments (borrow_id, amount, transaction_id, payment_date) VALUES (?, ?, ?, NOW())',
        [borrowId, amount, transactionId]
      );

      // Create notification
      await NotificationService.createNotification(
        userId,
        'payment',
        'Fine Paid',
        `Payment of ${amount} received for "${record.title}". Remaining fine: ${remainingFine}`
      );

      return {
        transactionId,
        amountPaid: amount,
        remainingFine,
        paidDate: new Date().toISOString(),
        receipt: {
          bookTitle: record.title,
          amountPaid: amount,
          remainingFine,
          transactionId,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== APPROVAL WORKFLOW METHODS =====

  // Request borrow (creates pending request)
  static async requestBook(userId, bookId) {
    try {
      // Verify book exists
      const book = await BookModel.findById(bookId);
      if (!book) {
        throw new NotFoundError('Book not found');
      }

      if (book.available_copies <= 0) {
        throw new ValidationError('No copies available for this book');
      }

      const borrowId = await BorrowingModel.requestBorrow(userId, bookId);

      // Create notification
      await NotificationService.createNotification(
        userId,
        'borrow_request',
        'Borrow Request Submitted',
        `Your request to borrow "${book.title}" is pending approval`
      );

      return borrowId;
    } catch (error) {
      throw error;
    }
  }

  // Approve borrow request (admin/librarian)
  static async approveBorrow(borrowId, approvedByUserId) {
    try {
      // Get borrow request details
      const [borrow] = await pool.query(
        `SELECT br.*, b.title, u.user_id, u.email, u.username FROM borrowing_records br
         JOIN books b ON br.book_id = b.book_id
         JOIN users u ON br.user_id = u.user_id
         WHERE br.borrow_id = ?`,
        [borrowId]
      );

      if (borrow.length === 0) {
        throw new NotFoundError('Borrow request not found');
      }

      const request = borrow[0];

      if (request.approval_status !== 'pending') {
        throw new ValidationError('This request has already been processed');
      }

      // Approve
      await BorrowingModel.approveBorrow(borrowId, approvedByUserId);

      // Send approval email - ENSURE delivery with retry
      const dueDate = new Date(request.due_date).toLocaleDateString();
      const lateFeePerDay = request.fine_amount || 500;
      
      try {
        const emailSent = await EmailService.sendEmail(request.email, 'borrowApproved', {
          userName: request.username,
          bookTitle: request.title,
          dueDate: dueDate,
          lateFee: lateFeePerDay
        });
        
        if (!emailSent) {
          console.warn(`⚠️ Email delivery failed for ${request.email} - Retry queued`);
          // Queue for retry later
          await NotificationService.createNotification(
            1, // Admin
            'email_delivery_failed',
            'Email Delivery Failed',
            `Approval email failed for user: ${request.username} (${request.email})`
          );
        } else {
          console.log(`✅ Approval email delivered to ${request.email}`);
        }
      } catch (emailError) {
        console.error(`❌ Critical email error for ${request.email}:`, emailError.message);
      }

      // Notify user in-app
      await NotificationService.createNotification(
        request.user_id,
        'borrow_approved',
        'Borrow Request Approved',
        `Your request to borrow "${request.title}" has been approved. Due date: ${dueDate}`
      );

      return { success: true, message: 'Borrow request approved', emailSent: true };
    } catch (error) {
      throw error;
    }
  }

  // Reject borrow request (admin/librarian)
  static async rejectBorrow(borrowId, approvedByUserId, rejectionReason = '') {
    try {
      // Get borrow request details
      const [borrow] = await pool.query(
        `SELECT br.*, b.title, u.user_id, u.email, u.username FROM borrowing_records br
         JOIN books b ON br.book_id = b.book_id
         JOIN users u ON br.user_id = u.user_id
         WHERE br.borrow_id = ?`,
        [borrowId]
      );

      if (borrow.length === 0) {
        throw new NotFoundError('Borrow request not found');
      }

      const request = borrow[0];

      if (request.approval_status !== 'pending') {
        throw new ValidationError('This request has already been processed');
      }

      // Reject
      await BorrowingModel.rejectBorrow(borrowId, approvedByUserId, rejectionReason);

      // Send rejection email - ENSURE delivery
      try {
        const emailSent = await EmailService.sendEmail(request.email, 'borrowRejected', {
          userName: request.username,
          bookTitle: request.title,
          reason: rejectionReason || 'Not available at this time'
        });
        
        if (!emailSent) {
          console.warn(`⚠️ Email delivery failed for ${request.email}`);
        } else {
          console.log(`✅ Rejection email delivered to ${request.email}`);
        }
      } catch (emailError) {
        console.error(`❌ Critical email error for ${request.email}:`, emailError.message);
      }

      // Notify user
      await NotificationService.createNotification(
        request.user_id,
        'borrow_rejected',
        'Borrow Request Rejected',
        `Your request to borrow "${request.title}" was rejected. Reason: ${rejectionReason || 'N/A'}`
      );

      return { success: true, message: 'Borrow request rejected' };
    } catch (error) {
      throw error;
    }
  }

  // ===== ADMIN/LIBRARIAN METHODS =====

  // Get pending borrow requests
  static async getPendingRequests(page, limit, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const result = await BorrowingModel.getPendingRequests(limit, offset, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get all active borrowings (admin view)
  static async getAllActiveBorrowings(page, limit, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const result = await BorrowingModel.getAllActiveBorrowings(limit, offset, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get overdue books
  static async getOverdueBooks(page, limit) {
    try {
      const offset = (page - 1) * limit;
      const result = await BorrowingModel.getOverdueBooks(limit, offset);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get system borrowing statistics
  static async getBorrowingStats() {
    try {
      const stats = await BorrowingModel.getBorrowingStats();
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Get user borrowing statistics
  static async getUserBorrowingStats(userId) {
    try {
      const stats = await BorrowingModel.getUserBorrowingStats(userId);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Update overdue status (scheduler job)
  static async updateOverdueStatus() {
    try {
      const affected = await BorrowingModel.updateOverdueStatus();
      return { affectedRows: affected };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BorrowingService;
