const User = require('../models/User');
const { generateToken } = require('../middlewares/auth.middleware');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 'User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      dateOfBirth
    });

    // Generate token
    const token = generateToken(user._id);

    sendSuccessResponse(res, {
      user,
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user (use password_hash field)
    const user = await User.findOne({ email }).select('+password_hash');

    if (!user) {
      return sendErrorResponse(res, 'Invalid credentials', 401);
    }

    // Check if password matches (password is stored in password_hash field)
    // For now, do direct comparison since passwords are plain text
    const isMatch = user.password_hash === password;

    if (!isMatch) {
      return sendErrorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return sendErrorResponse(res, 'Account is deactivated', 401);
    }

    // Generate token using user's generateAuthToken method (includes role)
    const token = user.generateAuthToken();

    sendSuccessResponse(res, {
      user,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just send a success response
    sendSuccessResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    sendSuccessResponse(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      avatar: req.body.avatar,
      favoriteGenres: req.body.favoriteGenres
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    sendSuccessResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);

    if (!isMatch) {
      return sendErrorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = req.body.newPassword;
    await user.save();

    sendSuccessResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return sendErrorResponse(res, 'User not found with this email', 404);
    }

    // In a real app, you would:
    // 1. Generate reset token
    // 2. Save reset token to database with expiry
    // 3. Send email with reset link

    // For now, just send success response
    sendSuccessResponse(res, null, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // In a real app, you would:
    // 1. Verify reset token
    // 2. Find user by reset token
    // 3. Update password
    // 4. Clear reset token

    sendSuccessResponse(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
