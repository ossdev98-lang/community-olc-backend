const db = require('../models');
const { success, error, paginate } = require('../utils/responseHandler');
const { Op } = require('sequelize');

async function listRequirements(req, res) {
  try {
    const {
      page = 1, limit = 20, search, category, city, condition, status, sort = 'newest',
      mine, active, expired, closed,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    else {
      where.status = { [Op.ne]: 'HIDDEN' };
      if (active === 'true') where.status = 'ACTIVE';
      if (expired === 'true') where.status = 'EXPIRED';
      if (closed === 'true') where.status = 'CLOSED';
    }
    if (category) {
      const categoryRecord = await db.Category.findOne({ where: { name: category } });
      // A missing category should return no rows instead of querying a column
      // that does not exist on requirements.
      where.category_id = categoryRecord?.id ?? -1;
    }
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (condition) where.condition = condition;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'expiring') order = [['expires_at', 'ASC']];
    if (sort === 'popular') order = [['quantity', 'DESC']];

    const { count, rows } = await db.Requirement.findAndCountAll({
      where,
      order,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [
        { model: db.Shop, as: 'shop', attributes: ['id', 'shop_name', 'city', 'is_verified'] },
        { model: db.Category, as: 'category', attributes: ['id', 'name', 'label'] },
        { model: db.RequirementImage, as: 'images', order: [['display_order', 'ASC']] },
      ],
    });

    return success(res, 'Requirements fetched', {
      requirements: rows,
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch requirements', 500);
  }
}

async function getRequirement(req, res) {
  try {
    const reqItem = await db.Requirement.findByPk(req.params.id, {
      include: [
        { model: db.Shop, as: 'shop', attributes: { exclude: ['business_documents'] } },
        { model: db.Category, as: 'category' },
        { model: db.RequirementImage, as: 'images', order: [['display_order', 'ASC']] },
      ],
    });
    if (!reqItem) return error(res, 'Requirement not found', 404);
    return success(res, 'Requirement fetched', { requirement: reqItem });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch requirement', 500);
  }
}

async function createRequirement(req, res) {
  try {
    const {
      title, category, productName, modelNumber, partName, description,
      quantity, condition, expectedPrice, location, duration,
    } = req.body;

    const user = req.user;
    const shop = await db.Shop.findOne({ where: { user_id: user.id } });
    if (!shop) return error(res, 'Shop not found', 404);
    if (shop.approval_status !== 'APPROVED') return error(res, 'Shop not approved', 403);

    const categoryRecord = await db.Category.findOne({ where: { name: category } });
    if (!categoryRecord) return error(res, 'Invalid category', 400);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseInt(duration, 10) * 60 * 60 * 1000);

    const requirement = await db.Requirement.create({
      user_id: user.id,
      shop_id: shop.id,
      category_id: categoryRecord.id,
      title,
      product_name: productName,
      model_number: modelNumber || null,
      part_name: partName || null,
      description,
      quantity: parseInt(quantity, 10) || 1,
      condition: condition.toUpperCase(),
      expected_price: expectedPrice || null,
      location: location || shop.city || null,
      city: shop.city || null,
      state: shop.state || null,
      status: 'ACTIVE',
      published_at: now,
      expires_at: expiresAt,
      closed_at: null,
      duration_hours: parseInt(duration, 10),
    });

    const images = req.files || [];
    if (images.length > 0) {
      await db.RequirementImage.bulkCreate(
        images.map((f, i) => ({
          requirement_id: requirement.id,
          image_path: f.path.replace(/\\/g, '/'),
          display_order: i,
        }))
      );
    }

    const created = await db.Requirement.findByPk(requirement.id, {
      include: [
        { model: db.Shop, as: 'shop', attributes: ['id', 'shop_name', 'city', 'is_verified'] },
        { model: db.Category, as: 'category' },
        { model: db.RequirementImage, as: 'images', order: [['display_order', 'ASC']] },
      ],
    });

    return success(res, 'Requirement created', { requirement: created }, 201);
  } catch (err) {
    return error(res, err.message || 'Failed to create requirement', 500);
  }
}

async function updateRequirement(req, res) {
  try {
    const requirement = await db.Requirement.findByPk(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (requirement.user_id !== req.user.id) return error(res, 'Not authorized', 403);
    if (requirement.status !== 'ACTIVE') return error(res, 'Cannot modify a non-active requirement', 400);

    const {
      title, category, productName, modelNumber, partName, description,
      quantity, condition, expectedPrice, location, duration,
    } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (productName) updates.product_name = productName;
    if (modelNumber !== undefined) updates.model_number = modelNumber;
    if (partName !== undefined) updates.part_name = partName;
    if (description) updates.description = description;
    if (quantity) updates.quantity = parseInt(quantity, 10);
    if (condition) updates.condition = condition.toUpperCase();
    if (expectedPrice !== undefined) updates.expected_price = expectedPrice;
    if (location) updates.location = location;
    if (duration) {
      updates.duration_hours = parseInt(duration, 10);
      updates.expires_at = new Date(Date.now() + parseInt(duration, 10) * 60 * 60 * 1000);
    }
    if (category) {
      const cat = await db.Category.findOne({ where: { name: category } });
      if (cat) updates.category_id = cat.id;
    }

    await requirement.update(updates);
    if (req.files?.length) {
      const currentImageCount = await db.RequirementImage.count({ where: { requirement_id: requirement.id } });
      if (currentImageCount + req.files.length > 5) {
        return error(res, `A requirement can have at most 5 images. It currently has ${currentImageCount}.`, 400);
      }
      await db.RequirementImage.bulkCreate(
        req.files.map((file, index) => ({
          requirement_id: requirement.id,
          image_path: file.path.replace(/\\/g, '/'),
          display_order: currentImageCount + index,
        })),
      );
    }
    const updatedRequirement = await db.Requirement.findByPk(requirement.id, {
      include: [
        { model: db.Category, as: 'category' },
        { model: db.RequirementImage, as: 'images', order: [['display_order', 'ASC']] },
      ],
    });
    return success(res, 'Requirement updated', { requirement: updatedRequirement });
  } catch (err) {
    return error(res, err.message || 'Failed to update requirement', 500);
  }
}

async function closeRequirement(req, res) {
  try {
    const requirement = await db.Requirement.findByPk(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (requirement.user_id !== req.user.id && req.user.role !== 'ADMIN') return error(res, 'Not authorized', 403);
    await requirement.update({ status: 'CLOSED', closed_at: new Date() });
    return success(res, 'Requirement closed', { requirement });
  } catch (err) {
    return error(res, err.message || 'Failed to close requirement', 500);
  }
}

async function renewRequirement(req, res) {
  try {
    const { duration } = req.body;
    const requirement = await db.Requirement.findByPk(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (requirement.user_id !== req.user.id) return error(res, 'Not authorized', 403);

    const hours = parseInt(duration, 10) || 24;
    await requirement.update({
      status: 'ACTIVE',
      expires_at: new Date(Date.now() + hours * 60 * 60 * 1000),
      published_at: new Date(),
      closed_at: null,
      duration_hours: hours,
    });
    return success(res, 'Requirement renewed', { requirement });
  } catch (err) {
    return error(res, err.message || 'Failed to renew requirement', 500);
  }
}

async function deleteRequirement(req, res) {
  try {
    const requirement = await db.Requirement.findByPk(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (requirement.user_id !== req.user.id && req.user.role !== 'ADMIN') return error(res, 'Not authorized', 403);
    await requirement.destroy();
    return success(res, 'Requirement deleted');
  } catch (err) {
    return error(res, err.message || 'Failed to delete requirement', 500);
  }
}

module.exports = {
  listRequirements, getRequirement, createRequirement, updateRequirement,
  closeRequirement, renewRequirement, deleteRequirement,
};
