const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getStatistics,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Admin routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);

module.exports = router;
