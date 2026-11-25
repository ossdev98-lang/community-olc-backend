const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { uploadRequirementImages, uploadErrorHandler } = require('../middleware/uploadMiddleware');
const { z } = require('zod');
const requirementController = require('../controllers/requirementController');

const createSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(1),
  productName: z.string().min(2),
  modelNumber: z.string().optional(),
  partName: z.string().optional(),
  description: z.string().min(5),
  quantity: z.string().min(1),
  condition: z.enum(['New', 'Used', 'Refurbished', 'Any']),
  expectedPrice: z.string().optional(),
  location: z.string().min(1),
  duration: z.string().min(1),
});

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().optional(),
  productName: z.string().min(2).optional(),
  modelNumber: z.string().optional(),
  partName: z.string().optional(),
  description: z.string().min(5).optional(),
  quantity: z.string().optional(),
  condition: z.enum(['New', 'Used', 'Refurbished', 'Any']).optional(),
  expectedPrice: z.string().optional(),
  location: z.string().min(1).optional(),
  duration: z.string().optional(),
});

const renewSchema = z.object({ duration: z.union([z.string().min(1), z.number().positive()]).optional() });

router.get('/', optionalAuthMiddleware, requirementController.listRequirements);
router.get('/:id', requirementController.getRequirement);
router.post('/', authMiddleware, uploadRequirementImages.array('images', 5), uploadErrorHandler, validationMiddleware(createSchema), requirementController.createRequirement);
router.put('/:id', authMiddleware, uploadRequirementImages.array('images', 5), uploadErrorHandler, validationMiddleware(updateSchema), requirementController.updateRequirement);
router.patch('/:id/close', authMiddleware, requirementController.closeRequirement);
router.patch('/:id/renew', authMiddleware, validationMiddleware(renewSchema), requirementController.renewRequirement);
router.delete('/:id', authMiddleware, requirementController.deleteRequirement);

module.exports = router;
