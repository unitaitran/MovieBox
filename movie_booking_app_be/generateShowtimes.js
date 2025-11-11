const mongoose = require('mongoose');
require('./src/models/Showtime');
require('./src/models/Movie');
require('./src/models/Cinema');

const Showtime = mongoose.model('Showtime');
const Movie = mongoose.model('Movie');
const Cinema = mongoose.model('Cinema');

async function generateShowtimes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/movie_booking_db');
    console.log('📅 Generating showtimes from 28/10/2025 to 10/11/2025...');
    
    const movies = await Movie.find({ status: 'now-showing' });
    const cinemas = await Cinema.find();
    
    console.log('Found', movies.length, 'movies and', cinemas.length, 'cinemas');
    
    const times = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'];
    let showtimeIdCounter = Date.now();
    const allShowtimes = [];
    
    // Generate for each day from 28/10 to 10/11
    const startDate = new Date('2025-10-28');
    const endDate = new Date('2025-11-10');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      console.log('📆 Generating for', dateStr);
      
      // For each cinema
      for (const cinema of cinemas) {
        // Select 3-5 random movies per cinema per day
        const numMovies = Math.floor(Math.random() * 3) + 3;
        const selectedMovies = [...movies].sort(() => 0.5 - Math.random()).slice(0, numMovies);
        
        for (const movie of selectedMovies) {
          // Each movie gets 2-4 showtimes
          const numShowtimes = Math.floor(Math.random() * 3) + 2;
          const selectedTimes = [...times].sort(() => 0.5 - Math.random()).slice(0, numShowtimes);
          
          for (const time of selectedTimes) {
            const roomNum = Math.floor(Math.random() * 4) + 1;
            const roomId = cinema._id + 'r' + roomNum;
            
            const [hours, minutes] = time.split(':');
            const startTime = new Date(dateStr);
            startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + (movie.duration || 120));
            
            allShowtimes.push({
              _id: 's' + showtimeIdCounter++,
              cinema_id: cinema._id,
              movie_id: movie._id,
              room_id: roomId,
              room_name: 'Room ' + roomNum,
              start_time: startTime,
              end_time: endTime,
              date: dateStr,
              time: time,
              price: 50000 + (Math.floor(Math.random() * 5) * 5000),
              available_seats: Math.floor(Math.random() * 15) + 15,
              total_seats: 30,
              language: movie.language || 'English',
              subtitle: 'Vietnamese'
            });
          }
        }
      }
    }
    
    console.log('📝 Generated', allShowtimes.length, 'showtimes total');
    console.log('💾 Inserting into database...');
    
    await Showtime.insertMany(allShowtimes, { ordered: false });
    
    console.log('✅ Done! Created', allShowtimes.length, 'showtimes');
    
    // Summary
    const summary = await Showtime.aggregate([
      { $match: { date: { $gte: '2025-10-28', $lte: '2025-11-10' } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 Summary by date:');
    summary.forEach(s => console.log('  ', s._id, ':', s.count, 'showtimes'));
    
    // Cinema summary
    const cinemaSummary = await Showtime.aggregate([
      { $match: { date: { $gte: '2025-10-28', $lte: '2025-11-10' } } },
      { $group: { _id: '$cinema_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🎬 Summary by cinema:');
    for (const cs of cinemaSummary) {
      const cinema = await Cinema.findById(cs._id);
      console.log('  ', cinema?.name || cs._id, ':', cs.count, 'showtimes');
    }
    
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️  Some showtimes already exist (duplicate IDs). This is normal.');
      process.exit(0);
    } else {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  }
}

generateShowtimes();
