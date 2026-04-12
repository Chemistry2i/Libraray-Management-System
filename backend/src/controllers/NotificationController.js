const NotificationModel = require('../models/NotificationModel');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');
const { NotFoundError } = require('../exceptions/AppError');

class NotificationController {
  // Get user notifications (paginated)
  static async getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      const { notifications, total } = await NotificationModel.getUserNotifications(
        req.user.user_id,
        limit,
        offset
      );

      sendPaginated(res, 'Notifications retrieved', notifications, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  // Get unread notification count
  static async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await NotificationModel.getUnreadCount(req.user.user_id);
      sendSuccess(res, 'Unread count retrieved', { unreadCount });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;

      // Verify ownership
      const notification = await NotificationModel.findById(id);
      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      if (notification.user_id !== req.user.user_id) {
        throw new Error('Unauthorized: Cannot mark other user notifications');
      }

      await NotificationModel.markAsRead(id);
      sendSuccess(res, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(req, res, next) {
    try {
      await NotificationModel.markAllAsRead(req.user.user_id);
      sendSuccess(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  static async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;

      // Verify ownership
      const notification = await NotificationModel.findById(id);
      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      if (notification.user_id !== req.user.user_id) {
        throw new Error('Unauthorized: Cannot delete other user notifications');
      }

      await NotificationModel.delete(id);
      sendSuccess(res, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
