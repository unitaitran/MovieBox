const Cinema = require('../models/Cinema');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// @desc    Get all cinemas
// @route   GET /api/v1/cinemas
// @access  Public
const getCinemas = async (req, res, next) => {
  try {
    const { page, limit, city, rating } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (city) filter.city = city;
    if (rating) filter.rating = { $gte: parseFloat(rating) };

    const cinemas = await Cinema.find(filter)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Cinema.countDocuments(filter);

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
  deleteRoom
};