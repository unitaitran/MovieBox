const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function() {
      return 'm' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
  },
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Movie description is required']
  },
  poster_url: {
    type: String,
    required: [true, 'Poster URL is required']
  },
  banner_url: {
    type: String,
    default: function() {
      return this.poster_url; // Use poster_url as banner if not provided
    }
  },
  director: {
    type: String,
    required: [true, 'Director name is required']
  },
  cast: [{
    type: String
  }],
  genre: {
    type: String,
    required: [true, 'Genre is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  release_date: {
    type: String,
    required: [true, 'Release date is required']
  },
  age_limit: {
    type: Number,
    required: [true, 'Age limit is required'],
    min: [0, 'Age limit must be 0 or higher']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['now-showing', 'coming-soon', 'ended'],
      message: 'Status must be either now-showing, coming-soon, or ended'
    }
  },
  rating: {
    type: Number,
    default: 0
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
