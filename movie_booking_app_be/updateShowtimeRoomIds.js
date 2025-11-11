const mongoose = require('mongoose');
require('dotenv').config();

const Showtime = require('./src/models/Showtime');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_booking';

async function updateShowtimeRoomIds() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all showtimes
    const showtimes = await Showtime.find();
    console.log(`\n📋 Found ${showtimes.length} showtimes to update`);

    let updated = 0;

    for (const showtime of showtimes) {
      const oldRoomId = showtime.room_id;
      
      // Convert old format (c001r2) to new format (c001_room2)
      if (oldRoomId && oldRoomId.includes('r') && !oldRoomId.includes('room')) {
        // Extract cinema and room number
        const match = oldRoomId.match(/^(c\d+)r(\d+)$/);
        
        if (match) {
          const cinemaId = match[1];
          const roomNumber = match[2];
          const newRoomId = `${cinemaId}_room${roomNumber}`;
          
          showtime.room_id = newRoomId;
          await showtime.save();
          
          updated++;
          if (updated % 100 === 0) {
            console.log(`  Updated ${updated} showtimes...`);
          }
        }
      }
    }

    console.log(`\n✅ Updated ${updated} showtimes`);
    console.log(`📊 Total showtimes: ${showtimes.length}`);

    // Show sample
    const sample = await Showtime.findOne();
    console.log('\n📝 Sample showtime after update:');
    console.log(`  ID: ${sample._id}`);
    console.log(`  room_id: ${sample.room_id}`);
    console.log(`  cinema_id: ${sample.cinema_id}`);

  } catch (error) {
    console.error('❌ Error updating showtime room IDs:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updateShowtimeRoomIds();
