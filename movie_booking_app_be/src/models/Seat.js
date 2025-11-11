const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  room_id: {
    type: String,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  cinema_id: {
    type: String,
    ref: 'Cinema',
    required: [true, 'Cinema ID is required']
  },
  seat_number: {
    type: String,
    required: [true, 'Seat number is required'] // e.g., "A1", "B5"
  },
  row: {
    type: String,
    required: [true, 'Row is required'] // e.g., "A", "B", "C"
  },
  number: {
    type: Number,
    required: [true, 'Number is required'] // e.g., 1, 2, 3
  },
  seat_type: {
    type: String,
    enum: ['standard', 'vip', 'couple'],
    default: 'standard'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 60000
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Index for better query performance
seatSchema.index({ room_id: 1 });
seatSchema.index({ cinema_id: 1 });
seatSchema.index({ status: 1 });
seatSchema.index({ seat_number: 1, room_id: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
