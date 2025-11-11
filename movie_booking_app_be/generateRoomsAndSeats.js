const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Cinema = require('./src/models/Cinema');
const Room = require('./src/models/Room');
const Seat = require('./src/models/Seat');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_booking';

// Configuration
const ROOMS_PER_CINEMA = 6;
const SEATS_PER_ROOM = 30;
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']; // 6 rows
const SEATS_PER_ROW = 5; // 5 seats per row = 30 total seats

const SCREEN_TYPES = ['2D', '3D', 'IMAX', '4DX'];
const SOUND_SYSTEMS = ['Standard', 'Dolby Atmos', 'DTS:X'];

async function generateRoomsAndSeats() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all cinemas
    console.log('\n📋 Fetching cinemas...');
    const cinemas = await Cinema.find();
    console.log(`✅ Found ${cinemas.length} cinemas`);

    if (cinemas.length === 0) {
      console.log('❌ No cinemas found. Please add cinemas first.');
      process.exit(1);
    }

    // Clear existing rooms and seats
    console.log('\n🗑️  Clearing existing rooms and seats...');
    await Room.deleteMany({});
    await Seat.deleteMany({});
    console.log('✅ Cleared existing data');

    let totalRooms = 0;
    let totalSeats = 0;

    // Generate rooms and seats for each cinema
    for (const cinema of cinemas) {
      console.log(`\n🎬 Processing cinema: ${cinema.name}`);

      const rooms = [];
      const seats = [];

      // Create 6 rooms for this cinema
      for (let roomNum = 1; roomNum <= ROOMS_PER_CINEMA; roomNum++) {
        const roomId = `${cinema._id}_room${roomNum}`;
        
        // Assign screen types and sound systems
        const screenType = SCREEN_TYPES[(roomNum - 1) % SCREEN_TYPES.length];
        const soundSystem = SOUND_SYSTEMS[(roomNum - 1) % SOUND_SYSTEMS.length];

        const room = {
          _id: roomId,
          cinema_id: cinema._id,
          name: `Phòng ${roomNum}`,
          room_number: roomNum,
          capacity: SEATS_PER_ROOM,
          screen_type: screenType,
          sound_system: soundSystem,
          status: 'active'
        };

        rooms.push(room);

        // Create 30 seats for this room (6 rows x 5 seats)
        for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex++) {
          const row = ROWS[rowIndex];
          
          for (let seatNum = 1; seatNum <= SEATS_PER_ROW; seatNum++) {
            const seatNumber = `${row}${seatNum}`;
            const seatId = `${roomId}_${seatNumber}`;

            // Pricing logic
            let price = 60000; // Base price
            let seatType = 'standard';

            // VIP seats (rows A and B) - more expensive
            if (rowIndex < 2) {
              price = 75000;
              seatType = 'vip';
            }
            // Couple seats (center seats in middle rows)
            else if (rowIndex >= 2 && rowIndex <= 3 && (seatNum === 2 || seatNum === 3 || seatNum === 4)) {
              price = 70000;
              seatType = 'couple';
            }

            const seat = {
              _id: seatId,
              room_id: roomId,
              cinema_id: cinema._id,
              seat_number: seatNumber,
              row: row,
              number: seatNum,
              seat_type: seatType,
              price: price,
              status: 'available'
            };

            seats.push(seat);
          }
        }
      }

      // Insert rooms and seats for this cinema
      await Room.insertMany(rooms);
      await Seat.insertMany(seats);

      totalRooms += rooms.length;
      totalSeats += seats.length;

      console.log(`  ✅ Created ${rooms.length} rooms and ${seats.length} seats`);
    }

    console.log('\n📊 Summary:');
    console.log(`  🎬 Total Cinemas: ${cinemas.length}`);
    console.log(`  🚪 Total Rooms: ${totalRooms}`);
    console.log(`  💺 Total Seats: ${totalSeats}`);
    console.log(`  📐 Configuration: ${ROOMS_PER_CINEMA} rooms/cinema, ${SEATS_PER_ROOM} seats/room`);

    // Show sample data
    console.log('\n📝 Sample Room:');
    const sampleRoom = await Room.findOne().populate('cinema_id', 'name');
    console.log(JSON.stringify(sampleRoom, null, 2));

    console.log('\n💺 Sample Seats from room:', sampleRoom.name);
    const sampleSeats = await Seat.find({ room_id: sampleRoom._id }).limit(5);
    sampleSeats.forEach(seat => {
      console.log(`  ${seat.seat_number} - ${seat.seat_type} - ${seat.price.toLocaleString('vi-VN')}đ`);
    });

    console.log('\n✅ Room and Seat generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating rooms and seats:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
generateRoomsAndSeats();
