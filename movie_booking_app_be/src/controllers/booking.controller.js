const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
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
      .populate('room', 'name room_number screen_type sound_system')
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
      .populate('cinema', 'name address contact')
      .populate('room', 'name room_number screen_type sound_system');

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
    const { movieId, cinemaId, roomId, showtime, seats, paymentMethod, transactionId, movieTitle, posterUrl, cinemaName } = req.body;

    // Try to find the actual showtime in database to get room_id
    let actualRoomId = roomId;
    let actualCinemaId = cinemaId;
    let actualMovieId = movieId;
    
    if (showtime && showtime.date && showtime.time) {
      // Query showtime from database
      const showtimeDoc = await Showtime.findOne({
        date: showtime.date,
        time: showtime.time,
        ...(movieId && { movie_id: movieId }),
        ...(cinemaId && { cinema_id: cinemaId })
      });

      if (showtimeDoc) {
        actualRoomId = showtimeDoc.room_id;
        actualCinemaId = showtimeDoc.cinema_id;
        actualMovieId = showtimeDoc.movie_id;
      }
    }

    // Validate movie exists (if movieId provided)
    let movie = null;
    if (actualMovieId) {
      movie = await Movie.findById(actualMovieId);
      if (!movie) {
        return sendErrorResponse(res, 'Movie not found', 404);
      }
    }

    // Validate cinema exists (if cinemaId provided)
    let cinema = null;
    if (actualCinemaId) {
      cinema = await Cinema.findById(actualCinemaId);
      if (!cinema) {
        return sendErrorResponse(res, 'Cinema not found', 404);
      }
    }

    // Validate room exists (if roomId provided)
    let room = null;
    if (actualRoomId) {
      room = await Room.findById(actualRoomId);
      if (!room) {
        return sendErrorResponse(res, 'Room not found', 404);
      }
    }

    // Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Create booking data
    const bookingData = {
      user: req.user.id,
      showtime,
      seats,
      totalAmount,
      paymentMethod: paymentMethod || 'momo',
    };

    // Set payment and booking status based on payment method
    if (paymentMethod === 'cash') {
      // Cash payment - pending until paid at counter
      bookingData.paymentStatus = 'pending';
      bookingData.bookingStatus = 'confirmed'; // Booking confirmed but payment pending
    } else if (transactionId) {
      // Online payment with transaction ID - completed
      bookingData.paymentStatus = 'completed';
      bookingData.bookingStatus = 'confirmed';
    } else {
      // Default - pending
      bookingData.paymentStatus = 'pending';
      bookingData.bookingStatus = 'pending';
    }

    // Add movie reference if exists
    if (actualMovieId && movie) {
      bookingData.movie = actualMovieId;
    }

    // Add cinema reference if exists
    if (actualCinemaId && cinema) {
      bookingData.cinema = actualCinemaId;
    }

    // Add room reference if exists (use actualRoomId from showtime)
    if (actualRoomId && room) {
      bookingData.room = actualRoomId;
    }

    // Add transaction ID if exists
    if (transactionId) {
      bookingData.transactionId = transactionId;
    }

    // Store extra info for display (nếu không có trong DB)
    if (movieTitle) bookingData.movieTitle = movieTitle;
    if (posterUrl) bookingData.posterUrl = posterUrl;
    if (cinemaName) bookingData.cinemaName = cinemaName;
    if (room) bookingData.roomName = room.name; // Add room name for display

    // Create booking
    const booking = await Booking.create(bookingData);

    // Update seat status to 'occupied' if payment is completed AND we have roomId
    if (bookingData.paymentStatus === 'completed' && actualRoomId) {
      // Update each seat to occupied
      for (const seat of seats) {
        const seatNumber = `${seat.row}${seat.number}`;
        const seatId = `${actualRoomId}_${seatNumber}`;
        
        try {
          await Seat.findByIdAndUpdate(
            seatId,
            { status: 'occupied' },
            { new: true }
          );
        } catch (seatError) {
          console.error(`Failed to update seat ${seatNumber}:`, seatError.message);
        }
      }
    }

    // Update user's total_spend if payment is completed
    if (bookingData.paymentStatus === 'completed') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { total_spend: totalAmount } }, // Increment total_spend
        { new: true }
      );
    }

    // Populate the created booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name address');

    sendSuccessResponse(res, populatedBooking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Create booking error:', error);
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

// @desc    Get occupied seats for a showtime
// @route   GET /api/v1/bookings/showtime/:showtimeId/seats
// @access  Public
const getOccupiedSeats = async (req, res, next) => {
  try {
    const { showtimeId } = req.params;
    const { date, time, cinemaId, movieId } = req.query;

    console.log('Getting occupied seats for:', { showtimeId, date, time, cinemaId, movieId });

    // Build query to find all confirmed bookings for this showtime
    // NOTE: We primarily filter by date and time since some bookings may not have cinema/movie references
    const query = {
      bookingStatus: { $in: ['pending', 'confirmed'] }, // Include pending and confirmed
      paymentStatus: { $ne: 'failed' } // Exclude failed payments
    };

    // MUST have date and time to identify a showtime
    if (date && time) {
      query['showtime.date'] = date;
      query['showtime.time'] = time;
    }

    // Optionally filter by cinema and movie (only if they exist in the booking data)
    if (cinemaId) {
      query.cinema = cinemaId;
    }
    if (movieId) {
      query.movie = movieId;
    }

    const bookings = await Booking.find(query);

    // Extract all occupied seats
    const occupiedSeats = [];
    bookings.forEach(booking => {
      if (booking.seats && booking.seats.length > 0) {
        booking.seats.forEach(seat => {
          occupiedSeats.push({
            seatId: `${seat.row}${seat.number}`,
            row: seat.row,
            number: seat.number,
            bookingId: booking._id,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus
          });
        });
      }
    });

    sendSuccessResponse(res, {
      showtimeId,
      date,
      time,
      cinemaId,
      movieId,
      occupiedSeats,
      totalBookings: bookings.length
    }, 'Occupied seats retrieved successfully');
  } catch (error) {
    console.error('Get occupied seats error:', error);
    next(error);
  }
};

// @desc    Get occupied seats for a showtime (from Seat model)
// @route   GET /api/v1/bookings/room/:roomId/occupied-seats
// @access  Public
const getOccupiedSeatsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { date, time } = req.query;

    if (!roomId) {
      return sendErrorResponse(res, 'Room ID is required', 400);
    }

    // Find occupied seats in this room
    const occupiedSeats = await Seat.find({
      room_id: roomId,
      status: { $in: ['occupied', 'reserved'] }
    });

    // Format response
    const formattedSeats = occupiedSeats.map(seat => ({
      seatId: seat.seat_number,
      seat_number: seat.seat_number,
      row: seat.row,
      number: seat.number,
      status: seat.status,
      seat_type: seat.seat_type,
      price: seat.price
    }));

    sendSuccessResponse(res, {
      roomId,
      date,
      time,
      occupiedSeats: formattedSeats,
      totalOccupied: formattedSeats.length
    }, 'Occupied seats retrieved successfully');
  } catch (error) {
    console.error('Get occupied seats by room error:', error);
    next(error);
  }
};

module.exports = {
  getUserBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getOccupiedSeats,
  getOccupiedSeatsByRoom
};
