const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./src/models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_booking';

async function normalizeBookingDates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bookings
    const bookings = await Booking.find();
    console.log(`\n📋 Found ${bookings.length} bookings to check`);

    let updated = 0;

    for (const booking of bookings) {
      const dateStr = booking.showtime.date;
      
      // Check if date is in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Convert to DD/MM/YYYY
        const [year, month, day] = dateStr.split('-');
        const newDate = `${day}/${month}/${year}`;
        
        booking.showtime.date = newDate;
        await booking.save();
        
        updated++;
        console.log(`  Updated: ${dateStr} → ${newDate}`);
      }
    }

    console.log(`\n✅ Updated ${updated} bookings`);
    console.log(`📊 Total bookings: ${bookings.length}`);

    // Show sample
    const sample = await Booking.findOne();
    console.log('\n📝 Sample booking after update:');
    console.log(`  Date: ${sample.showtime.date}`);
    console.log(`  Time: ${sample.showtime.time}`);

  } catch (error) {
    console.error('❌ Error normalizing booking dates:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

normalizeBookingDates();
