const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middleware/auth');

// Protected Routes - All notification routes require authentication
router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread', authenticate, NotificationController.getUnreadCount);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.patch('/mark-all-read', authenticate, NotificationController.markAllAsRead);
router.delete('/:id', authenticate, NotificationController.deleteNotification);

module.exports = router;
