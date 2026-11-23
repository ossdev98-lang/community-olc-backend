const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const shopController = require('../controllers/shopController');
const { uploadLogo, uploadDocument, uploadErrorHandler } = require('../middleware/uploadMiddleware');

router.get('/', shopController.listShops);
router.get('/:id', shopController.getShop);
router.get('/me', authMiddleware, shopController.getMyShop);
router.put('/me', authMiddleware, uploadLogo.single('logo'), uploadDocument.single('business_documents'), uploadErrorHandler, shopController.updateMyShop);

module.exports = router;
