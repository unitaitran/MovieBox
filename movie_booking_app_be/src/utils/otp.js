const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP with expiry (5 minutes)
const generateOTPWithExpiry = () => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return { otp, expiresAt };
};

// Verify OTP expiry
const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = {
  generateOTP,
  generateOTPWithExpiry,
  isOTPExpired
};