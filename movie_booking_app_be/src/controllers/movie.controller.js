const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// @desc    Get all movies
// @route   GET /api/v1/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    console.log('=== DEBUG getMovies ===');
    console.log('Database connection:', mongoose.connection.name);
    console.log('Collection name:', Movie.collection.name);
    
    const { page, limit, genre, status, sortBy } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (genre) filter.genre = genre;
    if (status) filter.status = status;
    
    console.log('Filter:', filter);

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
    
    console.log('Movies found:', movies.length);
    console.log('Total count:', total);
    console.log('Sample movie:', movies[0]);
    console.log('=== END DEBUG getMovies ===');

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
    console.log('=== Debug getMovie Start ===');
    const { id } = req.params;
    
    // Log tất cả movies để kiểm tra cấu trúc ID
    console.log('Checking all movies in database...');
    const allMovies = await Movie.find({}, '_id title').lean();
    console.log('All movies:', allMovies.map(m => ({
      id: m._id,
      id_type: typeof m._id,
      id_string: String(m._id),
      title: m.title
    })));
    
    console.log('Attempting to find movie with ID:', id);
    console.log('ID type:', typeof id);
    
    // Try to find the movie using different methods
    const movieByString = await Movie.findOne({ _id: id }).lean();
    const movieByRegex = await Movie.findOne({ 
      _id: { $regex: new RegExp(id, 'i') } 
    }).lean();
    
    console.log('Search results:', {
      byString: movieByString ? 'Found' : 'Not found',
      byRegex: movieByRegex ? 'Found' : 'Not found'
    });

    const movie = movieByString || movieByRegex;
    
    if (!movie) {
      console.log('Movie not found with any method');
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    // If found, get full details with population
    const fullMovie = await Movie.findOne({ _id: movie._id })
      .populate('showtimes.cinemaId')
      .lean();

    console.log('Full movie query result:', {
      found: !!movie,
      id: movie?._id,
      title: movie?.title
    });

    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    console.log('=== Debug getMovie Success ===');
    sendSuccessResponse(res, movie, 'Movie retrieved successfully');
  } catch (error) {
    console.error('=== Debug getMovie Error ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=== Debug getMovie Error End ===');
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/v1/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    console.log('📥 Creating movie with data:', req.body);
    console.log('📋 Request headers:', req.headers);
    console.log('📦 Request content-type:', req.get('content-type'));
    console.log('🔑 Request auth:', req.headers.authorization ? 'Present' : 'Missing');
    
    const movie = await Movie.create(req.body);

    console.log('✅ Movie created successfully:', movie._id);
    sendSuccessResponse(res, movie, 'Movie created successfully', 201);
  } catch (error) {
    console.error('❌ Create movie error:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      console.error('Validation errors:', errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/v1/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    console.log('📝 Updating movie:', req.params.id, 'with data:', req.body);
    
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    console.log('✅ Movie updated successfully:', movie._id);
    sendSuccessResponse(res, movie, 'Movie updated successfully');
  } catch (error) {
    console.error('❌ Update movie error:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      console.error('Validation errors:', errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
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