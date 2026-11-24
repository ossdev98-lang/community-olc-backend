const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const inquiryController = require('../controllers/inquiryController');
const messageController = require('../controllers/messageController');
const quotationController = require('../controllers/quotationController');
const { uploadChat, uploadErrorHandler } = require('../middleware/uploadMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { z } = require('zod');

router.post('/', authMiddleware, validationMiddleware(z.object({ requirementId: z.coerce.number().int().positive() })), inquiryController.createInquiry);
router.get('/', authMiddleware, inquiryController.listInquiries);
router.get('/:id', authMiddleware, inquiryController.getInquiry);
router.patch('/:id/read', authMiddleware, inquiryController.markRead);
router.patch('/:id/close', authMiddleware, inquiryController.closeInquiry);

router.get('/:id/messages', authMiddleware, messageController.listMessages);
router.post('/:id/messages', authMiddleware, uploadChat.single('attachment'), uploadErrorHandler, messageController.sendMessage);

router.post('/:conversationId/quotations', authMiddleware, quotationController.sendQuotation);
router.get('/:conversationId/quotations', authMiddleware, quotationController.listQuotations);

module.exports = router;
