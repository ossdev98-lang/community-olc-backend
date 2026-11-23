const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', authMiddleware, notificationController.listNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markRead);
router.patch('/read-all', authMiddleware, notificationController.markAllRead);
router.get('/unread-count', authMiddleware, notificationController.unreadCount);

module.exports = router;
