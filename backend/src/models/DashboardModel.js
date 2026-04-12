const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class DashboardModel {
  // Get system statistics (KYU Space inspired: institutional analytics)
  static async getSystemStats() {
    try {
      const [stats] = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'member') as total_members,
          (SELECT COUNT(*) FROM books) as total_books,
          (SELECT SUM(available_copies) FROM books) as available_books,
          (SELECT COUNT(*) FROM borrowing_records WHERE status = 'active') as active_borrows,
          (SELECT COUNT(*) FROM borrowing_records WHERE status = 'overdue') as overdue_books,
          (SELECT ROUND(SUM(fine_amount), 2) FROM borrowing_records WHERE status IN ('overdue', 'returned')) as total_fines_collected,
          (SELECT COUNT(*) FROM reservations WHERE status = 'pending') as pending_reservations,
          (SELECT COUNT(DISTINCT category_id) FROM books) as total_categories
      `);
      return stats[0];
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get overdue books with member details
  static async getOverdueBooks() {
    try {
      const [rows] = await pool.query(`
        SELECT
          br.borrow_id,
          br.user_id,
          u.username,
          u.email,
          u.phone,
          b.title,
          b.author,
          br.checkout_date,
          br.due_date,
          br.fine_amount,
          DATEDIFF(CURDATE(), br.due_date) as days_overdue
        FROM borrowing_records br
        JOIN users u ON br.user_id = u.user_id
        JOIN books b ON br.book_id = b.book_id
        WHERE br.status = 'overdue'
        ORDER BY br.due_date ASC
      `);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get borrowing activity for period (KYU Space: usage tracking)
  static async getBorrowingActivity(days = 30) {
    try {
      const [rows] = await pool.query(`
        SELECT
          DATE(checkout_date) as date,
          COUNT(*) as checkouts,
          COUNT(DISTINCT user_id) as unique_users
        FROM borrowing_records
        WHERE checkout_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(checkout_date)
        ORDER BY date DESC
      `, [days]);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get category statistics (Greenstone-inspired: collection analysis)
  static async getCategoryStats() {
    try {
      const [rows] = await pool.query(`
        SELECT
          c.category_id,
          c.category_name,
          COUNT(DISTINCT b.book_id) as total_books,
          COUNT(DISTINCT CASE WHEN b.available_copies > 0 THEN b.book_id END) as available_books,
          COUNT(DISTINCT CASE WHEN b.available_copies = 0 THEN b.book_id END) as unavailable_books,
          COUNT(br.borrow_id) as times_borrowed
        FROM categories c
        LEFT JOIN books b ON c.category_id = b.category_id
        LEFT JOIN borrowing_records br ON b.book_id = br.book_id
        GROUP BY c.category_id, c.category_name
        ORDER BY times_borrowed DESC
      `);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get member statistics
  static async getMemberStats() {
    try {
      const [rows] = await pool.query(`
        SELECT
          u.user_id,
          u.username,
          u.email,
          COUNT(br.borrow_id) as total_borrows,
          COUNT(CASE WHEN br.status = 'active' THEN 1 END) as active_borrows,
          COUNT(CASE WHEN br.status = 'overdue' THEN 1 END) as overdue_borrows,
          COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_reservations,
          ROUND(SUM(CASE WHEN br.status IN ('overdue', 'returned') THEN br.fine_amount ELSE 0 END), 2) as outstanding_fines
        FROM users u
        LEFT JOIN borrowing_records br ON u.user_id = br.user_id
        LEFT JOIN reservations r ON u.user_id = r.user_id
        WHERE u.role = 'member'
        GROUP BY u.user_id, u.username, u.email
        ORDER BY total_borrows DESC
      `);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get most borrowed books
  static async getMostBorrowedBooks(limit = 10) {
    try {
      const [rows] = await pool.query(`
        SELECT
          b.book_id,
          b.title,
          b.author,
          c.category_name,
          COUNT(br.borrow_id) as times_borrowed,
          COUNT(DISTINCT br.user_id) as unique_borrowers,
          b.available_copies
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.category_id
        LEFT JOIN borrowing_records br ON b.book_id = br.book_id
        GROUP BY b.book_id
        ORDER BY times_borrowed DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get collection growth over time
  static async getCollectionGrowth(months = 12) {
    try {
      const [rows] = await pool.query(`
        SELECT
          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%Y-%m') as month,
          COUNT(*) as books_added
        FROM (
          SELECT @num := @num + 1 as seq
          FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11) nums,
          (SELECT @num := 0) init
        ) months
        LEFT JOIN books b ON DATE_FORMAT(b.created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%Y-%m')
        GROUP BY month
        ORDER BY month DESC
      `);
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = DashboardModel;
