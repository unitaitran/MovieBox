const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  cinema_id: {
    type: String,
    ref: 'Cinema',
    required: [true, 'Cinema ID is required'],
  },
  movie_id: {
    type: String,
    ref: 'Movie',
    required: [true, 'Movie ID is required'],
  },
  room_id: {
    type: String,
    required: [true, 'Room ID is required'],
  },
  room_name: {
    type: String,
  },
  start_time: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  end_time: {
    type: Date,
    required: [true, 'End time is required'],
  },
  // Virtual fields for easier querying
  date: {
    type: String, // Format: YYYY-MM-DD
  },
  time: {
    type: String, // Format: HH:mm
  },
  price: {
    type: Number,
    default: 50000,
  },
  available_seats: {
    type: Number,
    default: 30,
  },
  total_seats: {
    type: Number,
    default: 30,
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'English',
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
  },
}, {
  timestamps: true,
});

// Index for better query performance
showtimeSchema.index({ cinema_id: 1, movie_id: 1, start_time: -1 });
showtimeSchema.index({ cinema_id: 1, date: 1 });
showtimeSchema.index({ start_time: 1 });
showtimeSchema.index({ date: 1, time: 1 });

// Pre-save hook to generate date and time from start_time
showtimeSchema.pre('save', function(next) {
  if (this.start_time && !this.date) {
    const startDate = new Date(this.start_time);
    this.date = startDate.toISOString().split('T')[0];
    this.time = startDate.toTimeString().slice(0, 5);
  }
  next();
});

module.exports = mongoose.model('Showtime', showtimeSchema);