const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: String, // Changed from ObjectId to String to match User model's custom _id
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: String, // Changed to String for consistency
    ref: 'Movie',
    required: false // Make optional for cases where movie might not be in DB
  },
  cinema: {
    type: String, // Changed to String for consistency
    ref: 'Cinema',
    required: false // Make optional for cases where cinema might not be in DB
  },
  room: {
    type: String,
    ref: 'Room',
    required: false // Room ID where the showtime takes place
  },
  // Extra fields for display when movie/cinema not in DB
  movieTitle: {
    type: String
  },
  posterUrl: {
    type: String
  },
  cinemaName: {
    type: String
  },
  roomName: {
    type: String
  },
  showtime: {
    date: {
      type: String,
      required: [true, 'Show date is required']
    },
    time: {
      type: String,
      required: [true, 'Show time is required']
    }
  },
  seats: [{
    row: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'zalopay', 'vnpay', 'cash', 'credit-card'],
    default: 'momo'
  },
  transactionId: {
    type: String // MoMo transaction ID
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingReference: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  qrCode: {
    type: String
  },
  specialRequests: {
    type: String,
    maxlength: [200, 'Special requests cannot be more than 200 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  cancelledAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ expiresAt: 1 });

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingReference = `MB${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Generate QR code (you can implement actual QR code generation here)
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCode) {
    this.qrCode = `QR${this.bookingReference}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
