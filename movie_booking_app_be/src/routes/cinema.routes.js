const express = require('express');
const {
  getCinemas,
  getCinema,
  createCinema,
  updateCinema,
  deleteCinema,
  getCinemasByCity,
  getCinemaRooms,
  getRoomById,
  updateRoom,
  createRoom,
  deleteRoom,
  getCinemaShowtimes
} = require('../controllers/cinema.controller');

const router = express.Router();

// Public routes
router.route('/city/:city')
  .get(getCinemasByCity);

// Showtimes route
router.route('/:id/showtimes')
  .get(getCinemaShowtimes);

// Room routes
router.route('/:id/rooms')
  .get(getCinemaRooms)
  .post(createRoom);

router.route('/:id/rooms/:roomId')
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

// Base routes
router.route('/')
  .get(getCinemas)
  .post(createCinema);

router.route('/:id')
  .get(getCinema)
  .put(updateCinema)
  .delete(deleteCinema);

module.exports = router;