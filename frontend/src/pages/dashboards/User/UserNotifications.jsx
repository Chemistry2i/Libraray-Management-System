import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';
import { notificationAPI } from '../../../api/endpoints';
import Swal from 'sweetalert2';

const notificationEmojis = {
  borrow_request: '📚',
  borrow_approved: '✅',
  borrow_rejected: '❌',
  reservation: '📚',
  payment: '💳',
  renewal: '🔄',
  email_delivery_failed: '⚠️',
};

const notificationColors = {
  borrow_request: 'bg-blue-50 border-blue-200',
  borrow_approved: 'bg-green-50 border-green-200',
  borrow_rejected: 'bg-red-50 border-red-200',
  reservation: 'bg-purple-50 border-purple-200',
  payment: 'bg-yellow-50 border-yellow-200',
  renewal: 'bg-indigo-50 border-indigo-200',
  email_delivery_failed: 'bg-orange-50 border-orange-200',
};

const notificationTextColors = {
  borrow_request: 'text-blue-900',
  borrow_approved: 'text-green-900',
  borrow_rejected: 'text-red-900',
  reservation: 'text-purple-900',
  payment: 'text-yellow-900',
  renewal: 'text-indigo-900',
  email_delivery_failed: 'text-orange-900',
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      const notifs = response.data?.data?.items || [];
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load notifications',
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifs =>
        notifs.map(n =>
          n.notification_id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(notifs =>
        notifs.filter(n => n.notification_id !== notificationId)
      );
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Notification removed successfully',
        timer: 2000,
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete notification',
        timer: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => notificationAPI.markAsRead(n.notification_id))
      );
      setNotifications(notifs =>
        notifs.map(n => ({ ...n, read: true }))
      );
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'All notifications marked as read',
        timer: 2000,
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getFilteredAndSortedNotifications = () => {
    let filtered = notifications;

    // Apply filter
    if (filter === 'unread') {
      filtered = notifications.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = notifications.filter(n => n.read);
    }

    // Apply sort
    if (sortBy === 'oldest') {
      return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const filteredNotifications = getFilteredAndSortedNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bell size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-500">
                {unreadCount === 0
                  ? 'All caught up!'
                  : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 enabled:hover:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw size={20} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 focus:outline-none focus:border-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'You don\'t have any notifications yet.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.notification_id}
              className={`border rounded-xl p-4 transition-all duration-200 ${
                notificationColors[notification.type] || 'bg-gray-50 border-gray-200'
              } ${!notification.read ? 'ring-2 ring-offset-0 ring-primary/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">
                      {notificationEmojis[notification.type] || '📬'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold ${
                          notificationTextColors[notification.type] || 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          notificationTextColors[notification.type] || 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.notification_id)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors title='Mark as read'"
                      title="Mark as read"
                    >
                      <Check size={18} className="text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.notification_id)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      {notifications.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900">{notifications.length}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-600 font-medium">Unread</p>
            <p className="text-2xl font-bold text-yellow-900">{unreadCount}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">Read</p>
            <p className="text-2xl font-bold text-green-900">
              {notifications.length - unreadCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
