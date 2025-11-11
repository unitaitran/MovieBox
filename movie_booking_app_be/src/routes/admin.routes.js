const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getStatistics,
} = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/statistics', getStatistics);

module.exports = router;
