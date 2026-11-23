const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const bookmarkController = require('../controllers/bookmarkController');

router.get('/', authMiddleware, bookmarkController.listBookmarks);
router.post('/:requirementId', authMiddleware, bookmarkController.addBookmark);
router.delete('/:requirementId', authMiddleware, bookmarkController.removeBookmark);
router.get('/:requirementId/check', authMiddleware, bookmarkController.isBookmarked);

module.exports = router;
