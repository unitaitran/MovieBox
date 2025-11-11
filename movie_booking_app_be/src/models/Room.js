const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  cinema_id: {
    type: String,
    ref: 'Cinema',
    required: [true, 'Cinema ID is required']
  },
  name: {
    type: String,
    required: [true, 'Room name is required']
  },
  room_number: {
    type: Number,
    required: [true, 'Room number is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    default: 30
  },
  screen_type: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX'],
    default: '2D'
  },
  sound_system: {
    type: String,
    enum: ['Standard', 'Dolby Atmos', 'DTS:X'],
    default: 'Standard'
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
roomSchema.index({ cinema_id: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
