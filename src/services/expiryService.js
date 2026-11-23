const db = require('../models');
const { success, error } = require('../utils/responseHandler');

async function runExpiryCheck() {
  const now = new Date();
  const result = await db.Requirement.update(
    { status: 'EXPIRED' },
    { where: { status: 'ACTIVE', expires_at: { [db.Sequelize.Op.lt]: now } } }
  );
  return result;
}

async function isExpired(requirement) {
  if (requirement.status !== 'ACTIVE') return true;
  if (requirement.expires_at && new Date(requirement.expires_at) <= new Date()) return true;
  return false;
}

module.exports = { runExpiryCheck, isExpired };
