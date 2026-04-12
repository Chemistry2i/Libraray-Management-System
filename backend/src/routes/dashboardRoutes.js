const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/appConstants');

// All dashboard routes require admin/librarian authentication
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN));

// Dashboard endpoints
router.get('/overview', DashboardController.getDashboardOverview);
router.get('/overdue', DashboardController.getOverdueBooks);
router.get('/activity', DashboardController.getBorrowingActivity);
router.get('/categories', DashboardController.getCategoryStats);
router.get('/members', DashboardController.getMemberStats);
router.get('/most-borrowed', DashboardController.getMostBorrowedBooks);
router.get('/collection-growth', DashboardController.getCollectionGrowth);
router.get('/report', DashboardController.generateReport);

module.exports = router;
