const NotificationModel = require('../models/NotificationModel');
const { NotFoundError } = require('../exceptions/AppError');
const { DEFAULT_LIMIT, DEFAULT_PAGE } = require('../constants/appConstants');

class NotificationService {
  // Get user notifications
  static async getUserNotifications(userId, page, limit) {
    const offset = (page - 1) * limit;
    const result = await NotificationModel.getUserNotifications(userId, limit, offset);
    return result;
  }

  // Get unread count
  static async getUnreadCount(userId) {
    return await NotificationModel.getUnreadCount(userId);
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Verify ownership
    if (notification.user_id !== userId) {
      throw new Error('Unauthorized access to this notification');
    }

    return await NotificationModel.markAsRead(notificationId);
  }

  // Mark all as read
  static async markAllAsRead(userId) {
    return await NotificationModel.markAllAsRead(userId);
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Verify ownership
    if (notification.user_id !== userId) {
      throw new Error('Unauthorized access to this notification');
    }

    return await NotificationModel.delete(notificationId);
  }

  // Create notification (system method)
  static async createNotification(userId, type, title, message) {
    return await NotificationModel.create({
      user_id: userId,
      type,
      title,
      message,
    });
  }

  // Bulk create notifications (for events)
  static async createBulkNotifications(notificationsList) {
    const promises = notificationsList.map((notification) =>
      NotificationModel.create(notification)
    );
    return Promise.all(promises);
  }

  // Create notification for reservation ready
  static async notifyReservationReady(userId, bookTitle) {
    return this.createNotification(
      userId,
      'reservation',
      'Reservation Ready!',
      `The book "${bookTitle}" that you reserved is now available. Please pick it up within 3 days.`
    );
  }

  // Create notification for overdue book
  static async notifyOverdueBook(userId, bookTitle, daysOverdue) {
    return this.createNotification(
      userId,
      'overdue',
      'Book Overdue',
      `Your book "${bookTitle}" is ${daysOverdue} day(s) overdue. Please return it to avoid fines.`
    );
  }

  // Create notification for upcoming due date
  static async notifyUpcomingDueDate(userId, bookTitle, daysRemaining) {
    return this.createNotification(
      userId,
      'reminder',
      'Book Due Soon',
      `Your book "${bookTitle}" is due in ${daysRemaining} day(s). Return it on time to avoid fines.`
    );
  }
}

module.exports = NotificationService;
