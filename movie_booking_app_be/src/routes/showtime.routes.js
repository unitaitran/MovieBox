const express = require('express');
const {
    getShowtimes,
    getShowtime,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByCinema,
    getShowtimesByMovie,
    getUpcomingShowtimes,
} = require('../controllers/showtime.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (không cần auth)
router.route('/cinema/:cinemaId')
    .get(getShowtimesByCinema);

router.route('/movie/:movieId')
    .get(getShowtimesByMovie);

router.route('/upcoming')
    .get(getUpcomingShowtimes);

// Base routes
router.route('/')
    .get(getShowtimes)
    .post(protect, authorize('admin'), createShowtime);

router.route('/:id')
    .get(getShowtime)
    .put(protect, authorize('admin'), updateShowtime)
    .delete(protect, authorize('admin'), deleteShowtime);

module.exports = router;