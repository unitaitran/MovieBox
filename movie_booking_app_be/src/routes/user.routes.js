const express = require('express');
const { sendOTP, verifyOTP, resendOTP, login, forgotPassword, resetPassword, getProfile, updateProfile, getCurrentOTP } = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Test route (REMOVE IN PRODUCTION)
router.get('/get-otp/:email', getCurrentOTP);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;