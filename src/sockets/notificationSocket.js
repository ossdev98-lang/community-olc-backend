const db = require('../models');

function createNotification(io, userId, notification) {
  io.to(`user_${userId}`).emit('notification', notification);
}

function notifyRequirementExpired(io, userId, requirement) {
  io.to(`user_${userId}`).emit('requirement_expired', { requirement });
}

function notifyRequirementExpiringSoon(io, userId, requirement) {
  io.to(`user_${userId}`).emit('requirement_expiring_soon', { requirement });
}

function notifyShopApproved(io, userId, shop) {
  io.to(`user_${userId}`).emit('shop_approved', { shop });
}

function notifyShopRejected(io, userId, shop, reason) {
  io.to(`user_${userId}`).emit('shop_rejected', { shop, reason });
}

module.exports = {
  createNotification,
  notifyRequirementExpired,
  notifyRequirementExpiringSoon,
  notifyShopApproved,
  notifyShopRejected,
};
