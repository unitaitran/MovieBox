const Movie = require('../models/Movie');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// @desc    Get all movies
// @route   GET /api/v1/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { page, limit, genre, status, sortBy } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (genre) filter.genre = genre;
    if (status) filter.status = status;

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'releaseDate':
        sort = { release_date: -1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const movies = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments(filter);

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie
// @route   GET /api/v1/movies/:id
// @access  Public
const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('showtimes.cinemaId');

    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    sendSuccessResponse(res, movie, 'Movie retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/v1/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);

    sendSuccessResponse(res, movie, 'Movie created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/v1/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    sendSuccessResponse(res, movie, 'Movie updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/v1/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    sendSuccessResponse(res, null, 'Movie deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by genre
// @route   GET /api/v1/movies/genre/:genre
// @access  Public
const getMoviesByGenre = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ genre: req.params.genre })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ genre: req.params.genre });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get now showing movies
// @route   GET /api/v1/movies/now-showing
// @access  Public
const getNowShowingMovies = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ status: 'now-showing' })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ status: 'now-showing' });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Now showing movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get coming soon movies
// @route   GET /api/v1/movies/coming-soon
// @access  Public
const getComingSoonMovies = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ status: 'coming-soon' })
      .sort({ release_date: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ status: 'coming-soon' });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Coming soon movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Search movies
// @route   GET /api/v1/movies/search
// @access  Public
const searchMovies = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    if (!q) {
      return sendErrorResponse(res, 'Search query is required', 400);
    }

    const movies = await Movie.find({
      $text: { $search: q }
    }, {
      score: { $meta: 'textScore' }
    })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({
      $text: { $search: q }
    });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by age limit
// @route   GET /api/v1/movies/age-limit/:ageLimit
// @access  Public
const getMoviesByAgeLimit = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);
    const ageLimit = parseInt(req.params.ageLimit);

    if (isNaN(ageLimit)) {
      return sendErrorResponse(res, 'Invalid age limit', 400);
    }

    const movies = await Movie.find({ age_limit: { $lte: ageLimit } })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ age_limit: { $lte: ageLimit } });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by language
// @route   GET /api/v1/movies/language/:language
// @access  Public
const getMoviesByLanguage = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ language: req.params.language })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ language: req.params.language });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by director
// @route   GET /api/v1/movies/director/:director
// @access  Public
const getMoviesByDirector = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ director: { $regex: req.params.director, $options: 'i' } })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ director: { $regex: req.params.director, $options: 'i' } });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by cast member
// @route   GET /api/v1/movies/cast/:castMember
// @access  Public
const getMoviesByCast = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const movies = await Movie.find({ cast: { $regex: req.params.castMember, $options: 'i' } })
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments({ cast: { $regex: req.params.castMember, $options: 'i' } });

    sendPaginatedResponse(res, movies, { page: pageNum, limit: limitNum, total }, 'Movies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};