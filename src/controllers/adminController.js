const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { Op } = require('sequelize');

async function adminDashboard(req, res) {
  try {
    const now = new Date();
    const totalShops = await db.Shop.count();
    const approvedShops = await db.Shop.count({ where: { approval_status: 'APPROVED' } });
    const pendingShops = await db.Shop.count({ where: { approval_status: 'PENDING' } });
    const rejectedShops = await db.Shop.count({ where: { approval_status: 'REJECTED' } });
    const suspendedShops = await db.Shop.count({ where: { approval_status: 'SUSPENDED' } });
    const activeRequirements = await db.Requirement.count({ where: { status: 'ACTIVE', expires_at: { [Op.gt]: now } } });
    const expiredRequirements = await db.Requirement.count({ where: { status: 'EXPIRED' } });
    const closedRequirements = await db.Requirement.count({ where: { status: 'CLOSED' } });
    const totalInquiries = await db.Conversation.count();

    const recentShops = await db.Shop.findAll({ order: [['created_at', 'DESC']], limit: 5, include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    const recentReqs = await db.Requirement.findAll({ order: [['created_at', 'DESC']], limit: 5, include: [{ model: db.Shop, as: 'shop', attributes: ['id', 'shop_name'] }] });

    return success(res, 'Admin dashboard data', {
      stats: {
        totalShops, approvedShops, pendingApprovals: pendingShops, rejectedShops,
        suspendedShops, activeRequirements, expiredRequirements, closedRequirements, totalInquiries,
      },
      recentShops, recentRequirements: recentReqs,
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch admin dashboard', 500);
  }
}

async function listShopsAdmin(req, res) {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [{ shop_name: { [Op.iLike]: `%${search}%` } }, { owner_name: { [Op.iLike]: `%${search}%` } }];
    }
    if (status) where.approval_status = status;
    const { count, rows } = await db.Shop.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10), offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }],
    });
    return success(res, 'Shops fetched', {
      shops: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch shops', 500);
  }
}

async function getShopAdmin(req, res) {
  try {
    const shop = await db.Shop.findByPk(req.params.id, { include: [{ model: db.User, as: 'user', attributes: { exclude: ['password'] } }] });
    if (!shop) return error(res, 'Shop not found', 404);
    return success(res, 'Shop fetched', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch shop', 500);
  }
}

async function approveShop(req, res) {
  try {
    const { id } = req.params;
    const shop = await db.Shop.findByPk(id);
    if (!shop) return error(res, 'Shop not found', 404);
    await shop.update({ approval_status: 'APPROVED', is_verified: true });
    const user = await db.User.findByPk(shop.user_id);
    await user.update({ status: 'APPROVED', is_verified: true });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'APPROVE_SHOP', entity_type: 'shop', entity_id: shop.id });
    await db.Notification.create({
      user_id: user.id, type: 'shop_approved', title: 'Shop Approved',
      message: `Your shop "${shop.shop_name}" has been approved by admin`,
      related_id: shop.id, related_type: 'shop',
    });
    return success(res, 'Shop approved', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to approve shop', 500);
  }
}

async function rejectShop(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const shop = await db.Shop.findByPk(id);
    if (!shop) return error(res, 'Shop not found', 404);
    await shop.update({ approval_status: 'REJECTED' });
    const user = await db.User.findByPk(shop.user_id);
    await user.update({ status: 'REJECTED' });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'REJECT_SHOP', entity_type: 'shop', entity_id: shop.id, details: reason });
    await db.Notification.create({
      user_id: user.id, type: 'shop_rejected', title: 'Shop Rejected',
      message: reason ? `Your shop "${shop.shop_name}" was rejected. Reason: ${reason}` : `Your shop "${shop.shop_name}" was rejected.`,
      related_id: shop.id, related_type: 'shop',
    });
    return success(res, 'Shop rejected', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to reject shop', 500);
  }
}

async function suspendShop(req, res) {
  try {
    const { id } = req.params;
    const shop = await db.Shop.findByPk(id);
    if (!shop) return error(res, 'Shop not found', 404);
    await shop.update({ approval_status: 'SUSPENDED' });
    const user = await db.User.findByPk(shop.user_id);
    await user.update({ status: 'SUSPENDED' });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'SUSPEND_SHOP', entity_type: 'shop', entity_id: shop.id });
    return success(res, 'Shop suspended', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to suspend shop', 500);
  }
}

async function reactivateShop(req, res) {
  try {
    const { id } = req.params;
    const shop = await db.Shop.findByPk(id);
    if (!shop) return error(res, 'Shop not found', 404);
    await shop.update({ approval_status: 'APPROVED' });
    const user = await db.User.findByPk(shop.user_id);
    await user.update({ status: 'APPROVED' });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'REACTIVATE_SHOP', entity_type: 'shop', entity_id: shop.id });
    return success(res, 'Shop reactivated', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to reactivate shop', 500);
  }
}

async function verifyShop(req, res) {
  try {
    const { id } = req.params;
    const shop = await db.Shop.findByPk(id);
    if (!shop) return error(res, 'Shop not found', 404);
    await shop.update({ is_verified: true });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'VERIFY_SHOP', entity_type: 'shop', entity_id: shop.id });
    return success(res, 'Shop verified', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to verify shop', 500);
  }
}

async function listRequirementsAdmin(req, res) {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { product_name: { [Op.iLike]: `%${search}%` } }];
    }
    if (status) where.status = status;
    const { count, rows } = await db.Requirement.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10), offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [{ model: db.Shop, as: 'shop', attributes: ['id', 'shop_name'] }],
    });
    return success(res, 'Requirements fetched', {
      requirements: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch requirements', 500);
  }
}

async function hideRequirement(req, res) {
  try {
    const { id } = req.params;
    const requirement = await db.Requirement.findByPk(id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    await requirement.update({ status: 'HIDDEN' });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'HIDE_REQUIREMENT', entity_type: 'requirement', entity_id: requirement.id });
    return success(res, 'Requirement hidden', { requirement });
  } catch (err) {
    return error(res, err.message || 'Failed to hide requirement', 500);
  }
}

async function unhideRequirement(req, res) {
  try {
    const { id } = req.params;
    const requirement = await db.Requirement.findByPk(id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    await requirement.update({ status: 'ACTIVE' });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'UNHIDE_REQUIREMENT', entity_type: 'requirement', entity_id: requirement.id });
    return success(res, 'Requirement restored', { requirement });
  } catch (err) {
    return error(res, err.message || 'Failed to restore requirement', 500);
  }
}

async function listReports(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await db.Report.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10), offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [
        { model: db.User, as: 'reporter', attributes: ['id', 'name'] },
        { model: db.User, as: 'reportedUser', attributes: ['id', 'name'] },
        { model: db.Requirement, as: 'requirement', attributes: ['id', 'title'] },
      ],
    });
    return success(res, 'Reports fetched', {
      reports: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch reports', 500);
  }
}

async function updateReport(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const report = await db.Report.findByPk(id);
    if (!report) return error(res, 'Report not found', 404);
    await report.update({ status, admin_notes: adminNotes });
    await db.AdminLog.create({ admin_user_id: req.user.id, action: 'UPDATE_REPORT', entity_type: 'report', entity_id: report.id });
    return success(res, 'Report updated', { report });
  } catch (err) {
    return error(res, err.message || 'Failed to update report', 500);
  }
}

async function listAdminLogs(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { count, rows } = await db.AdminLog.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10), offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [{ model: db.User, as: 'adminUser', attributes: ['id', 'name', 'email'] }],
    });
    return success(res, 'Admin logs fetched', { logs: rows, pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) } });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch admin logs', 500);
  }
}

module.exports = {
  adminDashboard, listShopsAdmin, getShopAdmin, approveShop, rejectShop,
  suspendShop, reactivateShop, verifyShop, listRequirementsAdmin,
  hideRequirement, unhideRequirement, listReports, updateReport, listAdminLogs,
};
