const db = require('../models');
const { success, error } = require('../utils/responseHandler');

async function addBookmark(req, res) {
  try {
    const { requirementId } = req.params;
    const user = req.user;
    const requirement = await db.Requirement.findByPk(requirementId);
    if (!requirement) return error(res, 'Requirement not found', 404);
    const bookmark = await db.Bookmark.findOne({ where: { user_id: user.id, requirement_id: requirementId } });
    if (bookmark) return error(res, 'Already bookmarked', 400);
    await db.Bookmark.create({ user_id: user.id, requirement_id: requirementId });
    return success(res, 'Requirement saved', { bookmarked: true }, 201);
  } catch (err) {
    return error(res, err.message || 'Failed to save requirement', 500);
  }
}

async function removeBookmark(req, res) {
  try {
    const { requirementId } = req.params;
    const user = req.user;
    await db.Bookmark.destroy({ where: { user_id: user.id, requirement_id: requirementId } });
    return success(res, 'Removed from saved', { bookmarked: false });
  } catch (err) {
    return error(res, err.message || 'Failed to remove bookmark', 500);
  }
}

async function listBookmarks(req, res) {
  try {
    const user = req.user;
    const { page = 1, limit = 20 } = req.query;
    const { count, rows } = await db.Bookmark.findAndCountAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      include: [{
        model: db.Requirement, as: 'requirement',
        include: [
          { model: db.Shop, as: 'shop', attributes: ['id', 'shop_name', 'city', 'is_verified'] },
          { model: db.Category, as: 'category', attributes: ['id', 'name', 'label'] },
          { model: db.RequirementImage, as: 'images', order: [['display_order', 'ASC']] },
        ],
      }],
    });
    return success(res, 'Bookmarks fetched', {
      bookmarks: rows.map((b) => b.requirement),
      pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch bookmarks', 500);
  }
}

async function isBookmarked(req, res) {
  try {
    const { requirementId } = req.params;
    const bookmark = await db.Bookmark.findOne({ where: { user_id: req.user.id, requirement_id: requirementId } });
    return success(res, 'Bookmark status fetched', { bookmarked: !!bookmark });
  } catch (err) {
    return error(res, err.message || 'Failed to check bookmark', 500);
  }
}

module.exports = { addBookmark, removeBookmark, listBookmarks, isBookmarked };
