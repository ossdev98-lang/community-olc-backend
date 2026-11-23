const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { Op } = require('sequelize');

async function getDashboard(req, res) {
  try {
    const user = req.user;
    const now = new Date();

    const activeReqs = await db.Requirement.count({ where: { user_id: user.id, status: 'ACTIVE', expires_at: { [Op.gt]: now } } });
    const expiringSoon = await db.Requirement.count({
      where: { user_id: user.id, status: 'ACTIVE', expires_at: { [Op.gt]: now, [Op.lt]: new Date(now.getTime() + 6 * 60 * 60 * 1000) } },
    });
    const unreadMessages = await db.Message.count({
      include: [{ model: db.Conversation, as: 'conversation', where: { [Op.or]: [{ owner_user_id: user.id }, { interested_user_id: user.id }] } }],
      where: { sender_user_id: { [Op.ne]: user.id }, is_read: false },
    });
    const unreadNotifications = await db.Notification.count({ where: { user_id: user.id, is_read: false } });

    const recentReqs = await db.Requirement.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{ model: db.Shop, as: 'shop', attributes: ['id', 'shop_name'] }],
    });
    const recentNotifs = await db.Notification.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    return success(res, 'Dashboard data', {
      stats: {
        activeRequirements: activeReqs,
        newInquiries: await db.Conversation.count({ where: { owner_user_id: user.id } }),
        unreadMessages,
        expiringSoon,
        unreadNotifications,
      },
      recentRequirements: recentReqs,
      recentNotifications: recentNotifs,
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch dashboard', 500);
  }
}

module.exports = { getDashboard };
