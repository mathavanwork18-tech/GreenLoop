import express from 'express';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  completeProfile,
} from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Phone OTP Authentication Flow (Rate Limited)
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/complete-profile', authLimiter, completeProfile);

// Legacy Email/Password Authentication (Rate Limited)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;
