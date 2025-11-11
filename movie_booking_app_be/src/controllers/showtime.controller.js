const Showtime = require('../models/Showtime');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// Helper function to get the correct start time field from document
const getStartTime = (showtimeObj) => {
  return showtimeObj.start_time || showtimeObj.startTime || null;
};

// Helper function to get the correct end time field from document
const getEndTime = (showtimeObj) => {
  return showtimeObj.end_time || showtimeObj.endTime || null;
};

// Helper function to split date and time for start_time with Vietnam timezone
const splitStartDateTime = (dateTime) => {
  if (!dateTime) return { startDate: null, startTimeOfDay: null };
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return { startDate: null, startTimeOfDay: null };
  
  // Convert to Vietnam timezone (UTC+7)
  const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const startDate = vietnamDate.toISOString().split('T')[0]; // Lấy ngày (YYYY-MM-DD)
  const startTimeOfDay = vietnamDate.toISOString().split('T')[1].split('.')[0]; // Lấy giờ (HH:MM:SS)
  return { startDate, startTimeOfDay };
};

// Helper function to split date and time for end_time with Vietnam timezone
const splitEndDateTime = (dateTime) => {
  if (!dateTime) return { endDate: null, endTimeOfDay: null };
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return { endDate: null, endTimeOfDay: null };
  
  // Convert to Vietnam timezone (UTC+7)
  const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const endDate = vietnamDate.toISOString().split('T')[0]; // Lấy ngày (YYYY-MM-DD)
  const endTimeOfDay = vietnamDate.toISOString().split('T')[1].split('.')[0]; // Lấy giờ (HH:MM:SS)
  return { endDate, endTimeOfDay };
};

// @desc    Get all showtimes
// @route   GET /api/v1/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    const { page, limit, cinemaId, movieId } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = {};
    if (cinemaId) filter.cinemaId = cinemaId;
    if (movieId) filter.movieId = movieId;

    // Sử dụng find thông thường trước
    const showtimes = await Showtime.find(filter)
      .sort({ start_time: -1 }) // Sử dụng start_time từ database
      .skip(skip)
      .limit(limitNum);

    // Tách ngày và giờ cho mỗi showtime
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      const startTimeValue = getStartTime(showtimeObj);
      const endTimeValue = getEndTime(showtimeObj);
      
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(startTimeValue).startDate,
        startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
        endDate: splitEndDateTime(endTimeValue).endDate,
        endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
        // Keep both formats for compatibility
        start_time: startTimeValue,
        end_time: endTimeValue,
        startTime: startTimeValue,
        endTime: endTimeValue
      };
    });

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
    const startTimeValue = getStartTime(showtimeObj);
    const endTimeValue = getEndTime(showtimeObj);
    
    console.log('Processing single showtime:', showtimeObj._id, 'startTime:', startTimeValue); // Debug log

    // Tách ngày và giờ
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(startTimeValue).startDate,
      startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
      endDate: splitEndDateTime(endTimeValue).endDate,
      endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
      // Keep both formats for compatibility
      start_time: startTimeValue,
      end_time: endTimeValue,
      startTime: startTimeValue,
      endTime: endTimeValue
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
    const startTimeValue = getStartTime(showtimeObj);
    const endTimeValue = getEndTime(showtimeObj);
    
    console.log('Created showtime startTime:', startTimeValue); // Debug log

    // Tách ngày và giờ để trả về phản hồi
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(startTimeValue).startDate,
      startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
      endDate: splitEndDateTime(endTimeValue).endDate,
      endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
      // Keep both formats for compatibility
      start_time: startTimeValue,
      end_time: endTimeValue,
      startTime: startTimeValue,
      endTime: endTimeValue
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
    const startTimeValue = getStartTime(showtimeObj);
    const endTimeValue = getEndTime(showtimeObj);
    
    console.log('Updated showtime start_time:', startTimeValue); // Debug log

    // Tách ngày và giờ
    const formattedShowtime = {
      ...showtimeObj,
      startDate: splitStartDateTime(startTimeValue).startDate,
      startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
      endDate: splitEndDateTime(endTimeValue).endDate,
      endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
      // Keep both formats for compatibility
      start_time: startTimeValue,
      end_time: endTimeValue,
      startTime: startTimeValue,
      endTime: endTimeValue
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

    // Support both camelCase and snake_case
    const showtimes = await Showtime.find({ 
      $or: [
        { cinemaId: req.params.cinemaId },
        { cinema_id: req.params.cinemaId }
      ]
    })
      .sort({ start_time: -1 }) // Sử dụng start_time từ database
      .skip(skip)
      .limit(limitNum);

    console.log('Found showtimes by cinema:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      const startTimeValue = getStartTime(showtimeObj);
      const endTimeValue = getEndTime(showtimeObj);
      
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(startTimeValue).startDate,
        startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
        endDate: splitEndDateTime(endTimeValue).endDate,
        endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
        // Keep both formats for compatibility
        start_time: startTimeValue,
        end_time: endTimeValue,
        startTime: startTimeValue,
        endTime: endTimeValue
      };
    });

    const total = await Showtime.countDocuments({ 
      $or: [
        { cinemaId: req.params.cinemaId },
        { cinema_id: req.params.cinemaId }
      ]
    });

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

    // Support both camelCase and snake_case
    const showtimes = await Showtime.find({ 
      $or: [
        { movieId: req.params.movieId },
        { movie_id: req.params.movieId }
      ]
    })
      .sort({ start_time: -1 }) // Sử dụng start_time từ database
      .skip(skip)
      .limit(limitNum);

    console.log('Found showtimes by movie:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      const startTimeValue = getStartTime(showtimeObj);
      const endTimeValue = getEndTime(showtimeObj);
      
      console.log('Processing movie showtime:', showtimeObj._id, 'startTime:', startTimeValue); // Debug log
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(startTimeValue).startDate,
        startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
        endDate: splitEndDateTime(endTimeValue).endDate,
        endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
        // Keep both formats for compatibility
        start_time: startTimeValue,
        end_time: endTimeValue,
        startTime: startTimeValue,
        endTime: endTimeValue
      };
    });

    const total = await Showtime.countDocuments({ 
      $or: [
        { movieId: req.params.movieId },
        { movie_id: req.params.movieId }
      ]
    });

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
      .sort({ start_time: 1 }) // Sử dụng start_time từ database
      .skip(skip)
      .limit(limitNum);

    console.log('Found upcoming showtimes:', showtimes.length); // Debug log

    // Tách ngày và giờ
    const formattedShowtimes = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      const startTimeValue = getStartTime(showtimeObj);
      const endTimeValue = getEndTime(showtimeObj);
      
      return {
        ...showtimeObj,
        startDate: splitStartDateTime(startTimeValue).startDate,
        startTimeOfDay: splitStartDateTime(startTimeValue).startTimeOfDay,
        endDate: splitEndDateTime(endTimeValue).endDate,
        endTimeOfDay: splitEndDateTime(endTimeValue).endTimeOfDay,
        // Keep both formats for compatibility
        start_time: startTimeValue,
        end_time: endTimeValue,
        startTime: startTimeValue,
        endTime: endTimeValue
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