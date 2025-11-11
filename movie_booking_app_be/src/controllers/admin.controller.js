const User = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password_hash')
      .sort({ created_at: -1 });

    sendSuccessResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Prevent deleting yourself
    if (user._id === req.user.id) {
      return sendErrorResponse(res, 'You cannot delete yourself', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    sendSuccessResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/v1/admin/statistics
// @access  Private/Admin
const getStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    
    const users = await User.find().select('total_spend');
    const totalRevenue = users.reduce((sum, user) => sum + (user.total_spend || 0), 0);

    sendSuccessResponse(res, {
      totalUsers,
      activeUsers,
      totalRevenue,
    }, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('Get statistics error:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getStatistics,
};
