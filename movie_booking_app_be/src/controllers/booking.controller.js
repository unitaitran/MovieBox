const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, paginate } = require('../utils/response');

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    // Build filter
    let filter = { user: req.user.id };
    if (status) filter.bookingStatus = status;

    const bookings = await Booking.find(filter)
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(filter);

    sendPaginatedResponse(res, bookings, { page: pageNum, limit: limitNum, total }, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('movie', 'title poster duration genre rating')
      .populate('cinema', 'name address contact');

    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to access this booking', 403);
    }

    sendSuccessResponse(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { movieId, cinemaId, showtime, seats } = req.body;

    // Validate movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendErrorResponse(res, 'Movie not found', 404);
    }

    // Validate cinema exists
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return sendErrorResponse(res, 'Cinema not found', 404);
    }

    // Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      movie: movieId,
      cinema: cinemaId,
      showtime,
      seats,
      totalAmount,
      paymentMethod: req.body.paymentMethod || 'credit-card'
    });

    // Populate the created booking
    await booking.populate([
      { path: 'movie', select: 'title poster duration' },
      { path: 'cinema', select: 'name address' }
    ]);

    sendSuccessResponse(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to update this booking', 403);
    }

    // Don't allow updates to confirmed bookings
    if (booking.bookingStatus === 'confirmed') {
      return sendErrorResponse(res, 'Cannot update confirmed booking', 400);
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'movie', select: 'title poster duration' },
      { path: 'cinema', select: 'name address' }
    ]);

    sendSuccessResponse(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to delete this booking', 403);
    }

    // Don't allow deletion of confirmed bookings
    if (booking.bookingStatus === 'confirmed') {
      return sendErrorResponse(res, 'Cannot delete confirmed booking', 400);
    }

    await Booking.findByIdAndDelete(req.params.id);

    sendSuccessResponse(res, null, 'Booking deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendErrorResponse(res, 'Booking not found', 404);
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, 'Not authorized to cancel this booking', 403);
    }

    // Check if booking can be cancelled
    if (booking.bookingStatus === 'cancelled') {
      return sendErrorResponse(res, 'Booking is already cancelled', 400);
    }

    if (booking.bookingStatus === 'confirmed') {
      return sendErrorResponse(res, 'Cannot cancel confirmed booking', 400);
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    await booking.populate([
      { path: 'movie', select: 'title poster duration' },
      { path: 'cinema', select: 'name address' }
    ]);

    sendSuccessResponse(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking
};
