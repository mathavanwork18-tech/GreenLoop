import express from 'express';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  completeProfile,
} from '../controllers/authController.js';

const router = express.Router();

// Phone OTP Authentication Flow
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', completeProfile);

// Legacy Email/Password Authentication (Preserved)
router.post('/register', register);
router.post('/login', login);

export default router;
