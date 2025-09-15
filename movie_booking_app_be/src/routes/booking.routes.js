const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getUserBookings,
  cancelBooking
} = require('../controllers/booking.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.use(protect); // All booking routes require authentication

router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
