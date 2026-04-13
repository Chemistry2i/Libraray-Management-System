const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class BorrowingModel {
  // Create a borrow request (status: pending_approval)
  static async requestBorrow(userId, bookId) {
    try {
      // Get available copy
      const [copies] = await pool.query(
        'SELECT copy_id FROM book_copies WHERE book_id = ? AND status = "available" LIMIT 1',
        [bookId]
      );

      if (copies.length === 0) {
        throw new Error('No available copies');
      }

      const copyId = copies[0].copy_id;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create borrowing record with pending_approval status
      const [result] = await pool.query(
        `INSERT INTO borrowing_records 
         (user_id, book_id, copy_id, due_date, approval_status) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, bookId, copyId, dueDate.toISOString().split('T')[0], 'pending']
      );

      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Approve a borrow request (admin/librarian only)
  static async approveBorrow(borrowId, approvedByUserId) {
    try {
      const today = new Date();
      
      const [result] = await pool.query(
        `UPDATE borrowing_records 
         SET approval_status = 'approved', 
             approved_by = ?, 
             approval_date = NOW(),
             status = 'active'
         WHERE borrow_id = ? AND approval_status = 'pending'`,
        [approvedByUserId, borrowId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Borrow request not found or already processed');
      }

      // Update copy status to borrowed
      const [borrow] = await pool.query('SELECT copy_id, book_id FROM borrowing_records WHERE borrow_id = ?', [borrowId]);
      if (borrow.length > 0) {
        await pool.query('UPDATE book_copies SET status = "borrowed" WHERE copy_id = ?', [borrow[0].copy_id]);
        await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?', [borrow[0].book_id]);
      }

      // Log audit (optional - wrap in try-catch to not break approval)
      try {
        await pool.query(
          `INSERT INTO borrowing_audit (borrow_id, action, performed_by, details) 
           VALUES (?, ?, ?, ?)`,
          [borrowId, 'approved', approvedByUserId, JSON.stringify({ status: 'Request approved' })]
        );
      } catch (auditError) {
        console.error('Audit logging failed (non-critical):', auditError.message);
      }

      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Reject a borrow request (admin/librarian only)
  static async rejectBorrow(borrowId, approvedByUserId, rejectionReason = '') {
    try {
      const [result] = await pool.query(
        `UPDATE borrowing_records 
         SET approval_status = 'rejected', 
             approved_by = ?,
             approval_date = NOW(),
             rejection_reason = ?,
             status = 'rejected'
         WHERE borrow_id = ? AND approval_status = 'pending'`,
        [approvedByUserId, rejectionReason, borrowId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Borrow request not found or already processed');
      }

      // Log audit (optional - wrap in try-catch to not break rejection)
      try {
        await pool.query(
          `INSERT INTO borrowing_audit (borrow_id, action, performed_by, details) 
           VALUES (?, ?, ?, ?)`,
          [borrowId, 'rejected', approvedByUserId, JSON.stringify({ reason: rejectionReason })]
        );
      } catch (auditError) {
        console.error('Audit logging failed (non-critical):', auditError.message);
      }

      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Legacy checkout method (kept for backward compatibility)
  static async checkout(userId, bookId) {
    return this.requestBorrow(userId, bookId);
  }

  static async returnBook(borrowId, userId) {
    try {
      // Get borrowing record
      const [records] = await pool.query(
        'SELECT * FROM borrowing_records WHERE borrow_id = ? AND user_id = ?',
        [borrowId, userId]
      );

      if (records.length === 0) {
        throw new Error('Borrowing record not found');
      }

      const record = records[0];
      let fine = 0;

      // Calculate fine if overdue
      const today = new Date();
      const dueDate = new Date(record.due_date);
      if (today > dueDate) {
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        fine = daysOverdue * 10;
      }

      // Update borrowing record
      await pool.query(
        'UPDATE borrowing_records SET return_date = ?, status = ?, fine_amount = ? WHERE borrow_id = ?',
        [today.toISOString().split('T')[0], 'returned', fine, borrowId]
      );

      // Update copy status
      await pool.query('UPDATE book_copies SET status = "available" WHERE copy_id = ?', [record.copy_id]);

      // Update available count
      await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?', [record.book_id]);

      return fine;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async getActiveBooks(userId) {
    try {
      const [records] = await pool.query(
        'SELECT br.*, b.title, b.author FROM borrowing_records br JOIN books b ON br.book_id = b.book_id WHERE br.user_id = ? AND br.status = "active"',
        [userId]
      );
      return records;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async getHistory(userId, limit, offset) {
    try {
      const [records] = await pool.query(
        'SELECT br.*, b.title, b.author FROM borrowing_records br JOIN books b ON br.book_id = b.book_id WHERE br.user_id = ? ORDER BY br.checkout_date DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM borrowing_records WHERE user_id = ?', [userId]);
      return { records, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // ===== ADMIN/LIBRARIAN METHODS =====

  // Get all pending borrow requests
  static async getPendingRequests(limit, offset, filters = {}) {
    try {
      let query = `
        SELECT br.*, b.title, b.author, u.username, u.email, u.phone
        FROM borrowing_records br
        JOIN books b ON br.book_id = b.book_id
        JOIN users u ON br.user_id = u.user_id
        WHERE br.approval_status = 'pending'
      `;

      const params = [];

      // Optional filters
      if (filters.userId) {
        query += ' AND br.user_id = ?';
        params.push(filters.userId);
      }

      query += ' ORDER BY br.checkout_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [records] = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM borrowing_records br WHERE br.approval_status = "pending"';
      if (filters.userId) countQuery += ' AND br.user_id = ?';
      
      const [count] = await pool.query(
        countQuery, 
        filters.userId ? [filters.userId] : []
      );

      return { records, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get all active borrowings (admin view)
  static async getAllActiveBorrowings(limit, offset, filters = {}) {
    try {
      let query = `
        SELECT br.*, b.title, b.author, u.username, u.email, u.phone
        FROM borrowing_records br
        JOIN books b ON br.book_id = b.book_id
        JOIN users u ON br.user_id = u.user_id
        WHERE br.status = 'active' AND br.approval_status = 'approved'
      `;

      const params = [];

      if (filters.userId) {
        query += ' AND br.user_id = ?';
        params.push(filters.userId);
      }
      if (filters.bookId) {
        query += ' AND br.book_id = ?';
        params.push(filters.bookId);
      }

      query += ' ORDER BY br.due_date ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [records] = await pool.query(query, params);

      let countQuery = 'SELECT COUNT(*) as total FROM borrowing_records WHERE status = "active" AND approval_status = "approved"';
      if (filters.userId) countQuery += ' AND user_id = ?';
      if (filters.bookId) countQuery += ' AND book_id = ?';

      const countParams = [];
      if (filters.userId) countParams.push(filters.userId);
      if (filters.bookId) countParams.push(filters.bookId);

      const [count] = await pool.query(countQuery, countParams);

      return { records, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get overdue books
  static async getOverdueBooks(limit, offset) {
    try {
      const [records] = await pool.query(
        `SELECT br.*, b.title, b.author, u.username, u.email,
                DATEDIFF(CURDATE(), br.due_date) as days_overdue
         FROM borrowing_records br
         JOIN books b ON br.book_id = b.book_id
         JOIN users u ON br.user_id = u.user_id
         WHERE br.status = 'overdue' OR (br.status = 'active' AND br.due_date < CURDATE())
         ORDER BY br.due_date ASC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const [count] = await pool.query(
        `SELECT COUNT(*) as total FROM borrowing_records 
         WHERE status = 'overdue' OR (status = 'active' AND due_date < CURDATE())`
      );

      return { records, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get borrowing statistics
  static async getBorrowingStats() {
    try {
      const [stats] = await pool.query(
        `SELECT 
           COUNT(CASE WHEN status = 'active' THEN 1 END) as total_active,
           COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as total_pending,
           COUNT(CASE WHEN status = 'overdue' THEN 1 END) as total_overdue,
           COUNT(CASE WHEN status = 'returned' THEN 1 END) as total_returned,
           COALESCE(SUM(fine_amount), 0) as total_outstanding_fines
         FROM borrowing_records`
      );

      return stats[0];
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get user borrowing statistics
  static async getUserBorrowingStats(userId) {
    try {
      const [stats] = await pool.query(
        `SELECT 
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
           COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_count,
           COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
           COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_count,
           COALESCE(SUM(fine_amount), 0) as total_fines,
           COALESCE(SUM(CASE WHEN fine_amount > 0 THEN 1 END), 0) as pending_fines_count
         FROM borrowing_records
         WHERE user_id = ?`,
        [userId]
      );

      return stats[0];
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Check if user has borrowed a book (for review eligibility)
  static async getUserBorrowedBooks(userId, bookId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM borrowing_records 
         WHERE user_id = ? AND book_id = ? AND status IN ('active', 'returned')`,
        [userId, bookId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Update borrow status to overdue (run by scheduler)
  static async updateOverdueStatus() {
    try {
      const [result] = await pool.query(
        `UPDATE borrowing_records 
         SET status = 'overdue' 
         WHERE status = 'active' AND due_date < CURDATE()`
      );

      return result.affectedRows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = BorrowingModel;
