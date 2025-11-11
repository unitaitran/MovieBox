const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getUserBookings,
  cancelBooking,
  getOccupiedSeats,
  getOccupiedSeatsByRoom
} = require('../controllers/booking.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes for getting occupied seats (MUST be before protect middleware)
router.get('/showtime/:showtimeId/seats', getOccupiedSeats);
router.get('/room/:roomId/occupied-seats', getOccupiedSeatsByRoom);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
