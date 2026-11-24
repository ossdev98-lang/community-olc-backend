const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { uploadLogo, uploadErrorHandler } = require('../middleware/uploadMiddleware');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(6),
  password: z.string().min(6),
  shopName: z.string().min(2),
  ownerName: z.string().min(2).optional(),
  businessType: z.preprocess((value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* Legacy clients send a single plain string. */ }
      return [value];
    }
    return value;
  }, z.array(z.string().min(2)).min(1)),
  city: z.string().min(2),
  state: z.string().min(2),
  address: z.string().min(2),
  gstin: z.string().optional(),
  description: z.string().optional(),
  specializations: z.preprocess((value) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  }, z.array(z.string()).optional()),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const forgotSchema = z.object({ email: z.string().email() });
const verifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6) });
const resetSchema = z.object({ email: z.string().email(), otp: z.string().length(6), password: z.string().min(6) });

router.post('/register', authLimiter, uploadLogo.single('logo'), uploadErrorHandler, validationMiddleware(registerSchema), authController.register);
router.post('/login', authLimiter, validationMiddleware(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validationMiddleware(forgotSchema), authController.forgotPassword);
router.post('/verify-otp', validationMiddleware(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validationMiddleware(resetSchema), authController.resetPassword);
router.get('/me', authMiddleware, authController.me);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
