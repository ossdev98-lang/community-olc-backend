const db = require('../models');
const { success, error } = require('../utils/responseHandler');

async function listNotifications(req, res) {
  try {
    const user = req.user;
    const { page = 1, limit = 20 } = req.query;
    const { count, rows } = await db.Notification.findAndCountAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });
    return success(res, 'Notifications fetched', {
      notifications: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch notifications', 500);
  }
}

async function markRead(req, res) {
  try {
    await db.Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
    return success(res, 'Notification marked read');
  } catch (err) {
    return error(res, err.message || 'Failed to mark read', 500);
  }
}

async function markAllRead(req, res) {
  try {
    await db.Notification.update({ is_read: true }, { where: { user_id: req.user.id } });
    return success(res, 'All notifications marked read');
  } catch (err) {
    return error(res, err.message || 'Failed to mark all read', 500);
  }
}

async function unreadCount(req, res) {
  try {
    const count = await db.Notification.count({ where: { user_id: req.user.id, is_read: false } });
    return success(res, 'Unread count fetched', { unreadCount: count });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch unread count', 500);
  }
}

module.exports = { listNotifications, markRead, markAllRead, unreadCount };
