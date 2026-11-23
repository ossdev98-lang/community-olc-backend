const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { Op } = require('sequelize');

async function listShops(req, res) {
  try {
    const { page = 1, limit = 20, search, city, businessType, specialization, verified } = req.query;
    const where = { approval_status: 'APPROVED' };
    if (search) {
      where[Op.or] = [
        { shop_name: { [Op.iLike]: `%${search}%` } },
        { owner_name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (businessType) where.business_type = businessType;
    if (verified === 'true') where.is_verified = true;
    if (specialization) {
      where[Op.and] = [
        { specializations: { [Op.contains]: [specialization] } },
      ];
    }
    const { count, rows } = await db.Shop.findAndCountAll({
      where,
      attributes: { exclude: ['business_documents'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });
    return success(res, 'Shops fetched', {
      shops: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch shops', 500);
  }
}

async function getShop(req, res) {
  try {
    const shop = await db.Shop.findByPk(req.params.id, {
      attributes: { exclude: ['business_documents'] },
      include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }],
    });
    if (!shop) return error(res, 'Shop not found', 404);
    return success(res, 'Shop fetched', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch shop', 500);
  }
}

async function getMyShop(req, res) {
  try {
    const shop = await db.Shop.findOne({ where: { user_id: req.user.id } });
    if (!shop) return error(res, 'Shop not found', 404);
    return success(res, 'My shop fetched', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch shop', 500);
  }
}

async function updateMyShop(req, res) {
  try {
    const shop = await db.Shop.findOne({ where: { user_id: req.user.id } });
    if (!shop) return error(res, 'Shop not found', 404);
    const {
      shopName, ownerName, businessType, description, mobile, email,
      address, city, state, pincode, specializations,
    } = req.body;
    const updates = {};
    if (shopName) updates.shop_name = shopName;
    if (ownerName) updates.owner_name = ownerName;
    if (businessType) updates.business_type = businessType;
    if (description !== undefined) updates.description = description;
    if (mobile) updates.mobile = mobile;
    if (email) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (pincode) updates.pincode = pincode;
    if (specializations) updates.specializations = Array.isArray(specializations) ? specializations : [];
    await shop.update(updates);
    return success(res, 'Shop updated', { shop });
  } catch (err) {
    return error(res, err.message || 'Failed to update shop', 500);
  }
}

module.exports = { listShops, getShop, getMyShop, updateMyShop };
