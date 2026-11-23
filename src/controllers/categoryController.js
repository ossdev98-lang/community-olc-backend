const db = require('../models');
const { success, error } = require('../utils/responseHandler');

async function listCategories(req, res) {
  try {
    const categories = await db.Category.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    return success(res, 'Categories fetched', { categories });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch categories', 500);
  }
}

async function createCategory(req, res) {
  try {
    const { name, label, icon } = req.body;
    const category = await db.Category.create({ name, label: label || name, icon });
    return success(res, 'Category created', { category }, 201);
  } catch (err) {
    return error(res, err.message || 'Failed to create category', 500);
  }
}

async function updateCategory(req, res) {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found', 404);
    const { name, label, icon, is_active } = req.body;
    await category.update({ name, label, icon, is_active });
    return success(res, 'Category updated', { category });
  } catch (err) {
    return error(res, err.message || 'Failed to update category', 500);
  }
}

async function deleteCategory(req, res) {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) return error(res, 'Category not found', 404);
    await category.update({ is_active: false });
    return success(res, 'Category deactivated');
  } catch (err) {
    return error(res, err.message || 'Failed to deactivate category', 500);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
