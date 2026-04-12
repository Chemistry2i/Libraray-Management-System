const DashboardModel = require('../models/DashboardModel');

class DashboardService {
  // Get complete dashboard overview (KYU Space inspired: institutional analytics)
  static async getDashboardOverview() {
    const stats = await DashboardModel.getSystemStats();
    return stats;
  }

  // Get overdue books with member contact info (for librarian follow-up)
  static async getOverdueBooks() {
    const overdueBooks = await DashboardModel.getOverdueBooks();
    return overdueBooks;
  }

  // Get borrowing activity trends
  static async getBorrowingActivity(days = 30) {
    const activity = await DashboardModel.getBorrowingActivity(days);
    return activity;
  }

  // Get category performance statistics (Greenstone-inspired collection analysis)
  static async getCategoryStats() {
    const stats = await DashboardModel.getCategoryStats();
    return stats;
  }

  // Get member activity and fines (for admin reporting)
  static async getMemberStats() {
    const stats = await DashboardModel.getMemberStats();
    return stats;
  }

  // Get most borrowed books (collection insights)
  static async getMostBorrowedBooks(limit = 10) {
    const books = await DashboardModel.getMostBorrowedBooks(limit);
    return books;
  }

  // Get collection growth trends
  static async getCollectionGrowth(months = 12) {
    const growth = await DashboardModel.getCollectionGrowth(months);
    return growth;
  }

  // Generate comprehensive report (admin only)
  static async generateComprehensiveReport() {
    const [overview, overdue, categoryStats, memberStats, mostBorrowed, collectionGrowth] = await Promise.all([
      DashboardModel.getSystemStats(),
      DashboardModel.getOverdueBooks(),
      DashboardModel.getCategoryStats(),
      DashboardModel.getMemberStats(),
      DashboardModel.getMostBorrowedBooks(5),
      DashboardModel.getCollectionGrowth(12),
    ]);

    return {
      overview,
      overdue,
      categoryStats,
      memberStats,
      mostBorrowed,
      collectionGrowth,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = DashboardService;
