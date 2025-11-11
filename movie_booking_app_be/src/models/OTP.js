const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  userData: {
    full_name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    phone_number: {
      type: String,
      required: true
    },
    password_hash: {
      type: String,
      required: true
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Index for faster queries
otpSchema.index({ email: 1, expiresAt: 1 });

module.exports = mongoose.model('OTP', otpSchema);