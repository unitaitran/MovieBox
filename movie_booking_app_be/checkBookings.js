const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking_db';

async function checkBookings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    
    const bookings = await Booking.find()
      .populate('movie', 'title')
      .populate('cinema', 'name')
      .populate('room', 'name')
      .populate('user', 'email full_name');
    
    console.log(`\n📊 Total bookings: ${bookings.length}\n`);
    
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking._id}`);
      console.log(`  User: ${booking.user?.full_name || booking.user?.email || 'Unknown'} (${booking.user?._id})`);
      console.log(`  Movie: ${booking.movie?.title || booking.movieTitle || 'Unknown'}`);
      console.log(`  Cinema: ${booking.cinema?.name || booking.cinemaName || 'Unknown'}`);
      console.log(`  Room: ${booking.room?.name || booking.roomName || 'N/A'}`);
      console.log(`  Showtime: ${booking.showtime?.date} ${booking.showtime?.time}`);
      console.log(`  Seats: ${booking.seats?.map(s => `${s.row}${s.number}`).join(', ')}`);
      console.log(`  Status: ${booking.bookingStatus}`);
      console.log(`  Payment: ${booking.paymentStatus}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBookings();
