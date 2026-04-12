const DashboardService = require('../services/DashboardService');
const { sendSuccess } = require('../utils/response');

class DashboardController {
  // Get dashboard overview
  static async getDashboardOverview(req, res, next) {
    try {
      const overview = await DashboardService.getDashboardOverview();
      sendSuccess(res, 'Dashboard overview retrieved', { overview });
    } catch (error) {
      next(error);
    }
  }

  // Get overdue books
  static async getOverdueBooks(req, res, next) {
    try {
      const overdueBooks = await DashboardService.getOverdueBooks();
      sendSuccess(res, `Found ${overdueBooks.length} overdue books`, { overdueBooks });
    } catch (error) {
      next(error);
    }
  }

  // Get borrowing activity
  static async getBorrowingActivity(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const activity = await DashboardService.getBorrowingActivity(days);
      sendSuccess(res, `Borrowing activity for last ${days} days retrieved`, { activity });
    } catch (error) {
      next(error);
    }
  }

  // Get category statistics (Greenstone-inspired collection analysis)
  static async getCategoryStats(req, res, next) {
    try {
      const stats = await DashboardService.getCategoryStats();
      sendSuccess(res, 'Category statistics retrieved', { stats });
    } catch (error) {
      next(error);
    }
  }

  // Get member statistics
  static async getMemberStats(req, res, next) {
    try {
      const stats = await DashboardService.getMemberStats();
      sendSuccess(res, 'Member statistics retrieved', { stats });
    } catch (error) {
      next(error);
    }
  }

  // Get most borrowed books
  static async getMostBorrowedBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const books = await DashboardService.getMostBorrowedBooks(limit);
      sendSuccess(res, 'Most borrowed books retrieved', { books });
    } catch (error) {
      next(error);
    }
  }

  // Get collection growth
  static async getCollectionGrowth(req, res, next) {
    try {
      const months = parseInt(req.query.months) || 12;
      const growth = await DashboardService.getCollectionGrowth(months);
      sendSuccess(res, `Collection growth for last ${months} months retrieved`, { growth });
    } catch (error) {
      next(error);
    }
  }

  // Generate comprehensive report (admin only)
  static async generateReport(req, res, next) {
    try {
      const report = await DashboardService.generateComprehensiveReport();
      sendSuccess(res, 'Comprehensive report generated', { report });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
