const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/dashboard', authMiddleware, adminMiddleware, adminController.adminDashboard);
router.get('/shops', authMiddleware, adminMiddleware, adminController.listShopsAdmin);
router.get('/shops/:id', authMiddleware, adminMiddleware, adminController.getShopAdmin);
router.post('/shops/:id/approve', authMiddleware, adminMiddleware, adminController.approveShop);
router.post('/shops/:id/reject', authMiddleware, adminMiddleware, adminController.rejectShop);
router.post('/shops/:id/suspend', authMiddleware, adminMiddleware, adminController.suspendShop);
router.post('/shops/:id/reactivate', authMiddleware, adminMiddleware, adminController.reactivateShop);
router.post('/shops/:id/verify', authMiddleware, adminMiddleware, adminController.verifyShop);
router.get('/requirements', authMiddleware, adminMiddleware, adminController.listRequirementsAdmin);
router.patch('/requirements/:id/hide', authMiddleware, adminMiddleware, adminController.hideRequirement);
router.patch('/requirements/:id/unhide', authMiddleware, adminMiddleware, adminController.unhideRequirement);
router.get('/reports', authMiddleware, adminMiddleware, adminController.listReports);
router.patch('/reports/:id', authMiddleware, adminMiddleware, adminController.updateReport);
router.get('/logs', authMiddleware, adminMiddleware, adminController.listAdminLogs);

module.exports = router;
