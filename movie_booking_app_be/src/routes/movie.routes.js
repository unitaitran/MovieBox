const express = require('express');
const {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByGenre,
  getNowShowingMovies,
  getComingSoonMovies,
  searchMovies,
  getMoviesByAgeLimit,
  getMoviesByLanguage,
  getMoviesByDirector,
  getMoviesByCast
} = require('../controllers/movie.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

// Public routes
router.route('/search')
  .get(searchMovies);

router.route('/now-showing')
  .get(getNowShowingMovies);

router.route('/coming-soon')
  .get(getComingSoonMovies);

router.route('/genre/:genre')
  .get(getMoviesByGenre);

router.route('/age-limit/:ageLimit')
  .get(getMoviesByAgeLimit);

router.route('/language/:language')
  .get(getMoviesByLanguage);

router.route('/director/:director')
  .get(getMoviesByDirector);

router.route('/cast/:castMember')
  .get(getMoviesByCast);

// Base routes
router.route('/')
  .get(getMovies)
  .post(protect, authorize('admin'), createMovie);

router.route('/:id')
  .get(getMovie)
  .put(protect, authorize('admin'), updateMovie)
  .delete(protect, authorize('admin'), deleteMovie);

module.exports = router;module.exports = router;