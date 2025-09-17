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
const { param, query } = require('express-validator');

const router = express.Router();

// Middleware log debug (tạm thời, chỉ trong dev mode)
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log(`Movie route: ${req.method} ${req.path} - Params:`, req.params, 'Query:', req.query);
    next();
  });
}

// Public routes
router.route('/search')
  .get(
    [query('q').optional().trim().escape()],
    searchMovies
  );

router.route('/now-showing')
  .get(getNowShowingMovies);

router.route('/coming-soon')
  .get(getComingSoonMovies);

router.route('/genre/:genre')
  .get(
    [param('genre').trim().escape()], // Validation cho :genre
    getMoviesByGenre
  );

router.route('/age-limit/:ageLimit')
  .get(
    [param('ageLimit').isInt({ min: 0 })], // Validation cho :ageLimit là số nguyên >= 0
    getMoviesByAgeLimit
  );

router.route('/language/:language')
  .get(
    [param('language').trim().escape()], // Validation cho :language
    getMoviesByLanguage
  );

router.route('/director/:director')
  .get(
    [param('director').trim().escape()], // Validation cho :director
    getMoviesByDirector
  );

router.route('/cast/:castMember')
  .get(
    [param('castMember').trim().escape()], // Validation cho :castMember
    getMoviesByCast
  );

// Base routes
router.route('/')
  .get(getMovies)
  .post(
    protect,
    authorize('admin'),
    [/* Thêm body validation nếu cần, ví dụ: body('title').notEmpty() */],
    createMovie
  );

router.route('/:id')
  .get(
    getMovie
  )
  .put(
    protect,
    authorize('admin'),
    updateMovie
  )
  .delete(
    protect,
    authorize('admin'),
    deleteMovie
  );

module.exports = router;