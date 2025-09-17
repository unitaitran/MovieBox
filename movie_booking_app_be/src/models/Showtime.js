const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  _id: {
    type: String, // Sử dụng chuỗi nếu dữ liệu dùng "s001"
    required: true,
  },
  cinemaId: {
    type: String, // Điều chỉnh thành String nếu dữ liệu dùng "c001"
    ref: 'Cinema',
    required: [true, 'Cinema ID is required'],
  },
  movieId: {
    type: String, // Điều chỉnh thành String nếu dữ liệu dùng "68c38f7f5b66ee7381f38a79" là chuỗi
    ref: 'Movie',
    required: [true, 'Movie ID is required'],
  },
  roomId: {
    type: String,
    required: [true, 'Room ID is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'English',
  },
  subtitle: {
    type: String, // Hoặc dùng [String] nếu có nhiều phụ đề
    required: [true, 'Subtitle is required'],
  },
}, {
  timestamps: true,
});

// Index for better query performance
showtimeSchema.index({ cinemaId: 1, movieId: 1, startTime: -1 });
showtimeSchema.index({ status: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);