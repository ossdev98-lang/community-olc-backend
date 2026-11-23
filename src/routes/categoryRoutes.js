const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { z } = require('zod');
const categoryController = require('../controllers/categoryController');

const categorySchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1).optional(),
  icon: z.string().optional(),
});

router.get('/', categoryController.listCategories);
router.post('/', authMiddleware, adminMiddleware, validationMiddleware(categorySchema), categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, validationMiddleware(categorySchema), categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;
