const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// @desc    Get all cinemas
// @route   GET /api/v1/cinemas
// @access  Public
const getCinemas = async (req, res, next) => {
  try {
    console.log('=== DEBUG getCinemas ===');
    console.log('Collection name:', Cinema.collection.name);
    
    const { page, limit, city, rating } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (city) filter.city = city;
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    
    console.log('Filter:', filter);

    const cinemas = await Cinema.find(filter)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Cinema.countDocuments(filter);
    
    console.log('Cinemas found:', cinemas.length);
    console.log('Total count:', total);
    console.log('Sample cinema:', cinemas[0]);
    console.log('=== END DEBUG getCinemas ===');

    sendPaginatedResponse(res, cinemas, { page: pageNum, limit: limitNum, total }, 'Cinemas retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single cinema
// @route   GET /api/v1/cinemas/:id
// @access  Public
const getCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    sendSuccessResponse(res, cinema, 'Cinema retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new cinema
// @route   POST /api/v1/cinemas
// @access  Private/Admin
const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    sendSuccessResponse(res, cinema, 'Cinema created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cinema
// @route   PUT /api/v1/cinemas/:id
// @access  Private/Admin
const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    sendSuccessResponse(res, cinema, 'Cinema updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cinema
// @route   DELETE /api/v1/cinemas/:id
// @access  Private/Admin
const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);

    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    sendSuccessResponse(res, null, 'Cinema deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get cinemas by city
// @route   GET /api/v1/cinemas/city/:city
// @access  Public
const getCinemasByCity = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const cinemas = await Cinema.find({ city: req.params.city })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Cinema.countDocuments({ city: req.params.city });

    sendPaginatedResponse(res, cinemas, { page: pageNum, limit: limitNum, total }, 'Cinemas retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get cinema rooms
// @route   GET /api/v1/cinemas/:id/rooms
// @access  Public
const getCinemaRooms = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    sendSuccessResponse(res, cinema.rooms, 'Cinema rooms retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID
// @route   GET /api/v1/cinemas/:id/rooms/:roomId
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }
    const room = cinema.rooms.id(req.params.roomId);
    if (!room) {
      return sendErrorResponse(res, 'Room not found', 404);
    }
    sendSuccessResponse(res, room, 'Room retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create room
// @route   POST /api/v1/cinemas/:id/rooms
// @access  Private/Admin
const createRoom = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }
    cinema.rooms.push(req.body);
    await cinema.save();
    const newRoom = cinema.rooms[cinema.rooms.length - 1];
    sendSuccessResponse(res, newRoom, 'Room created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/v1/cinemas/:id/rooms/:roomId
// @access  Private/Admin
const updateRoom = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }
    const room = cinema.rooms.id(req.params.roomId);
    if (!room) {
      return sendErrorResponse(res, 'Room not found', 404);
    }
    Object.assign(room, req.body);
    await cinema.save();
    sendSuccessResponse(res, room, 'Room updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/v1/cinemas/:id/rooms/:roomId
// @access  Private/Admin
const deleteRoom = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }
    const room = cinema.rooms.id(req.params.roomId);
    if (!room) {
      return sendErrorResponse(res, 'Room not found', 404);
    }
    room.remove();
    await cinema.save();
    sendSuccessResponse(res, null, 'Room deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCinemas,
  getCinema,
  createCinema,
  updateCinema,
  deleteCinema,
  getCinemasByCity,
  getCinemaRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getCinemaShowtimes
};

// @desc    Get cinema showtimes for today
// @route   GET /api/v1/cinemas/:id/showtimes
// @access  Public
async function getCinemaShowtimes(req, res, next) {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    // Get cinema
    const cinema = await Cinema.findById(id);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    // Use provided date or today's date
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`Fetching showtimes for cinema ${id} on ${targetDate}`);

    // Get all showtimes for this cinema on the target date
    const showtimes = await Showtime.find({
      cinema_id: id,
      date: targetDate
    }).sort({ time: 1 });

    console.log(`Found ${showtimes.length} showtimes`);

    // Group showtimes by movie
    const movieShowtimesMap = {};
    
    for (const showtime of showtimes) {
      if (!movieShowtimesMap[showtime.movie_id]) {
        // Get movie details
        const movie = await Movie.findById(showtime.movie_id);
        
        movieShowtimesMap[showtime.movie_id] = {
          movieId: showtime.movie_id,
          movieTitle: movie?.title || 'Unknown Movie',
          moviePoster: movie?.poster_url || '',
          movieDuration: movie?.duration || 0,
          movieRating: movie?.rating || 0,
          showtimes: []
        };
      }
      
      // Add showtime to the movie's showtimes array
      movieShowtimesMap[showtime.movie_id].showtimes.push({
        showtimeId: showtime._id,
        time: showtime.time,
        roomId: showtime.room_id, // Use room_id from database
        roomName: showtime.room_name,
        price: showtime.price,
        availableSeats: showtime.available_seats,
        totalSeats: showtime.total_seats
      });
    }

    // Convert map to array
    const movieShowtimes = Object.values(movieShowtimesMap);

    sendSuccessResponse(res, {
      cinema: {
        id: cinema._id,
        name: cinema.name,
        address: cinema.address,
        city: cinema.city,
        rating: cinema.rating
      },
      date: targetDate,
      movies: movieShowtimes,
      totalMovies: movieShowtimes.length,
      totalShowtimes: showtimes.length
    }, 'Cinema showtimes retrieved successfully');
  } catch (error) {
    console.error('Get cinema showtimes error:', error);
    next(error);
  }
}