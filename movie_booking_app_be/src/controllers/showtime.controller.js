const Showtime = require('../models/Showtime');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// Helper function to split date and time for start_time
const splitStartDateTime = (dateTime) => {
  if (!dateTime || typeof dateTime !== 'string') return { startDate: null, startTimeOfDay: null };
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return { startDate: null, startTimeOfDay: null }; // Kiểm tra nếu date không hợp lệ
  const startDate = date.toISOString().split('T')[0]; // Lấy ngày (YYYY-MM-DD)
  const startTimeOfDay = date.toTimeString().split(' ')[0]; // Lấy giờ (HH:MM:SS)
  return { startDate, startTimeOfDay };
};

// Helper function to split date and time for end_time
const splitEndDateTime = (dateTime) => {
  if (!dateTime || typeof dateTime !== 'string') return { endDate: null, endTimeOfDay: null };
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return { endDate: null, endTimeOfDay: null }; // Kiểm tra nếu date không hợp lệ
  const endDate = date.toISOString().split('T')[0]; // Lấy ngày (YYYY-MM-DD)
  const endTimeOfDay = date.toTimeString().split(' ')[0]; // Lấy giờ (HH:MM:SS)
  return { endDate, endTimeOfDay };
};

// @desc    Get all showtimes
// @route   GET /api/v1/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    console.log('Query params:', req.query); // Debug log
    const { page, limit, cinemaId, movieId } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (cinemaId) filter.cinemaId = cinemaId;
    if (movieId) filter.movieId = movieId;

    // Build sort
    let sort = {};
    switch (req.query.sortBy) {
      case 'date':
        sort = { start_time: -1 }; // Sử dụng start_time để sắp xếp
        break;
      default:
        sort = { createdAt: -1 };
    }

    const showtimes = await Showtime.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    console.log('Found showtimes raw:', showtimes); // Debug log raw data

    // Tách ngày và giờ cho mỗi showtime
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      console.log('Processing showtime:', showtimeObj._id, 'start_time:', showtimeObj.start_time, 'end_time:', showtimeObj.end_time); // Debug log raw times
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(showtimeObj.start_time).startDate,
        startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
        endDate: splitEndDateTime(showtimeObj.end_time).endDate,
        endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
      };
    });

    console.log('Formatted showtimes sample:', formattedShowtimes[0]); // Debug log formatted data

    const total = await Showtime.countDocuments(filter);

    sendPaginatedResponse(res, formattedShowtimes, { page: pageNum, limit: limitNum, total }, 'Showtimes retrieved successfully');
  } catch (error) {
    console.error('Error in getShowtimes:', error); // Debug log
    next(error);
  }
};

// @desc    Get single showtime
// @route   GET /api/v1/showtimes/:id
// @access  Public
const getShowtime = async (req, res, next) => {
  try {
    console.log('Request params:', req.params); // Debug log
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return sendErrorResponse(res, 'Showtime not found', 404);
    }

    const showtimeObj = showtime.toObject();
    console.log('Processing single showtime:', showtimeObj._id, 'start_time:', showtimeObj.start_time); // Debug log

    // Tách ngày và giờ
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(showtimeObj.start_time).startDate,
      startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
      endDate: splitEndDateTime(showtimeObj.end_time).endDate,
      endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
    };

    sendSuccessResponse(res, formattedShowtime, 'Showtime retrieved successfully');
  } catch (error) {
    console.error('Error in getShowtime:', error); // Debug log
    next(error);
  }
};

// @desc    Create new showtime
// @route   POST /api/v1/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    console.log('Request body:', req.body); // Debug log
    const showtime = await Showtime.create(req.body);

    const showtimeObj = showtime.toObject();
    console.log('Created showtime start_time:', showtimeObj.start_time); // Debug log

    // Tách ngày và giờ để trả về phản hồi
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(showtimeObj.start_time).startDate,
      startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
      endDate: splitEndDateTime(showtimeObj.end_time).endDate,
      endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
    };

    sendSuccessResponse(res, formattedShowtime, 'Showtime created successfully', 201);
  } catch (error) {
    console.error('Error in createShowtime:', error); // Debug log
    next(error);
  }
};

// @desc    Update showtime
// @route   PUT /api/v1/showtimes/:id
// @access  Private/Admin
const updateShowtime = async (req, res, next) => {
  try {
    console.log('Request params and body:', req.params, req.body); // Debug log
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!showtime) {
      return sendErrorResponse(res, 'Showtime not found', 404);
    }

    const showtimeObj = showtime.toObject();
    console.log('Updated showtime start_time:', showtimeObj.start_time); // Debug log

    // Tách ngày và giờ
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(showtimeObj.start_time).startDate,
      startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
      endDate: splitEndDateTime(showtimeObj.end_time).endDate,
      endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
    };

    sendSuccessResponse(res, formattedShowtime, 'Showtime updated successfully');
  } catch (error) {
    console.error('Error in updateShowtime:', error); // Debug log
    next(error);
  }
};

// @desc    Delete showtime
// @route   DELETE /api/v1/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res, next) => {
  try {
    console.log('Request params:', req.params); // Debug log
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return sendErrorResponse(res, 'Showtime not found', 404);
    }

    sendSuccessResponse(res, null, 'Showtime deleted successfully');
  } catch (error) {
    console.error('Error in deleteShowtime:', error); // Debug log
    next(error);
  }
};

// @desc    Get showtimes by cinema
// @route   GET /api/v1/showtimes/cinema/:cinemaId
// @access  Public
const getShowtimesByCinema = async (req, res, next) => {
  try {
    console.log('Request params:', req.params); // Debug log
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const showtimes = await Showtime.find({ cinemaId: req.params.cinemaId })
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(limitNum);

    console.log('Found showtimes by cinema:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(showtimeObj.start_time).startDate,
        startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
        endDate: splitEndDateTime(showtimeObj.end_time).endDate,
        endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
      };
    });

    const total = await Showtime.countDocuments({ cinemaId: req.params.cinemaId });

    sendPaginatedResponse(res, formattedShowtimes, { page: pageNum, limit: limitNum, total }, 'Showtimes retrieved successfully');
  } catch (error) {
    console.error('Error in getShowtimesByCinema:', error); // Debug log
    next(error);
  }
};

// @desc    Get showtimes by movie
// @route   GET /api/v1/showtimes/movie/:movieId
// @access  Public
const getShowtimesByMovie = async (req, res, next) => {
  try {
    console.log('Request params:', req.params); // Debug log
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const showtimes = await Showtime.find({ movieId: req.params.movieId })
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(limitNum);

    console.log('Found showtimes by movie:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      console.log('Processing movie showtime:', showtimeObj._id, 'start_time:', showtimeObj.start_time); // Debug log
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(showtimeObj.start_time).startDate,
        startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
        endDate: splitEndDateTime(showtimeObj.end_time).endDate,
        endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
      };
    });

    const total = await Showtime.countDocuments({ movieId: req.params.movieId });

    sendPaginatedResponse(res, formattedShowtimes, { page: pageNum, limit: limitNum, total }, 'Showtimes retrieved successfully');
  } catch (error) {
    console.error('Error in getShowtimesByMovie:', error); // Debug log
    next(error);
  }
};

// @desc    Get upcoming showtimes
// @route   GET /api/v1/showtimes/upcoming
// @access  Public
const getUpcomingShowtimes = async (req, res, next) => {
  try {
    console.log('Query params:', req.query); // Debug log
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Định nghĩa upcoming dựa trên start_time > current date
    const currentDate = new Date();
    const showtimes = await Showtime.find({ start_time: { $gt: currentDate } })
      .sort({ start_time: 1 })
      .skip(skip)
      .limit(limitNum);

    console.log('Found upcoming showtimes:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(showtimeObj.start_time).startDate,
        startTimeOfDay: splitStartDateTime(showtimeObj.start_time).startTimeOfDay,
        endDate: splitEndDateTime(showtimeObj.end_time).endDate,
        endTimeOfDay: splitEndDateTime(showtimeObj.end_time).endTimeOfDay,
      };
    });

    const total = await Showtime.countDocuments({ start_time: { $gt: currentDate } });

    sendPaginatedResponse(res, formattedShowtimes, { page: pageNum, limit: limitNum, total }, 'Upcoming showtimes retrieved successfully');
  } catch (error) {
    console.error('Error in getUpcomingShowtimes:', error); // Debug log
    next(error);
  }
};

module.exports = {
  getShowtimes,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByCinema,
  getShowtimesByMovie,
  getUpcomingShowtimes,
};