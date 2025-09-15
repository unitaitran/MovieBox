const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, 'Room ID is required']
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  }
});

const cinemaSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, 'Cinema ID is required']
  },
  name: {
    type: String,
    required: [true, 'Cinema name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  rooms: [roomSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cinema', cinemaSchema);