const mongoose = require('mongoose');
const { generateToken } = require('../utils/jwt');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, 'User ID is required']
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be positive'],
    max: [120, 'Age must be realistic']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  total_spend: {
    type: Number,
    default: 0,
    min: [0, 'Total spend cannot be negative']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't include password in queries by default
  },
  profile_image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
  return generateToken({
    userId: this._id, 
    email: this.email,
    rank: this.rank,
    role: this.role 
  });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password_hash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
