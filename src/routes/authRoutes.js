const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(6),
  password: z.string().min(6),
  shopName: z.string().min(2),
  ownerName: z.string().min(2).optional(),
  businessType: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  address: z.string().min(2),
  gstin: z.string().optional(),
  description: z.string().optional(),
  specializations: z.array(z.string()).optional(),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const forgotSchema = z.object({ email: z.string().email() });
const verifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6) });
const resetSchema = z.object({ email: z.string().email(), otp: z.string().length(6), password: z.string().min(6) });

router.post('/register', authLimiter, validationMiddleware(registerSchema), authController.register);
router.post('/login', authLimiter, validationMiddleware(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validationMiddleware(forgotSchema), authController.forgotPassword);
router.post('/verify-otp', validationMiddleware(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validationMiddleware(resetSchema), authController.resetPassword);
router.get('/me', authMiddleware, authController.me);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
