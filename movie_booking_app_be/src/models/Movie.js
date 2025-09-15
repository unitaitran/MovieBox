const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  genre: {
    type: String,
    required: true,
    enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Adventure', 'Animation']
  },
  duration: {
    type: Number,
    required: [true, 'Movie duration is required'],
    min: [60, 'Duration must be at least 60 minutes']
  },
  release_date: {
    type: Date,
    required: [true, 'Release date is required']
  },
  director: {
    type: String,
    required: [true, 'Director name is required'],
    trim: true
  },
  cast: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
  },
  age_limit: {
    type: Number,
    required: true,
    min: [0, 'Age limit cannot be negative']
  },
  poster_url: {
    type: String,
    required: [true, 'Movie poster URL is required']
  },
  trailer: {
    type: String,
    required: [true, 'Movie trailer is required']
  },
  status: {
    type: String,
    enum: ['coming-soon', 'now-showing', 'ended'],
    default: 'coming-soon'
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  language: {
    type: String,
    required: true,
    default: 'English'
  },
  subtitles: [{
    type: String
  }],
  price: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: [0, 'Price cannot be negative']
  },
  showtimes: [{
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    times: [{
      time: {
        type: String,
        required: true
      },
      availableSeats: {
        type: Number,
        default: 100
      }
    }]
  }]
}, {
  timestamps: true
});

// Index for better search performance
movieSchema.index({ title: 'text', description: 'text', genre: 'text' });
movieSchema.index({ release_date: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ status: 1 });

module.exports = mongoose.model('Movie', movieSchema);
