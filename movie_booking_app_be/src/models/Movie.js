const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  poster_url: {
    type: String,
    required: true
  },
  banner_url: {
    type: String,
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: [{
    type: String
  }],
  genre: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  release_date: {
    type: String,
    required: true
  },
  age_limit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['now-showing', 'coming-soon', 'ended']
  },
  rating: {
    type: String,
    required: true
  },
  showtimes: [{
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema'
    },
    date: Date,
    times: [{
      time: String,
      availableSeats: {
        type: Number,
        default: 100
      }
    }]
  }]
}, {
  timestamps: true,
  _id: false // Disable auto-generated ObjectId
});

// Indexes for better search performance
movieSchema.index({ title: 'text', description: 'text', genre: 'text' });
movieSchema.index({ release_date: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ status: 1 });

module.exports = mongoose.model('Movie', movieSchema);
