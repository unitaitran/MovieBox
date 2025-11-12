require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');

// Kết nối database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_booking_db');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Tạo showtime ID
const generateShowtimeId = () => {
  return 'st' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Tạo showtimes cho 5 ngày tới
const seedShowtimes = async () => {
  try {
    console.log('🎬 Bắt đầu tạo showtimes...\n');

    // Lấy tất cả movies và cinemas
    const movies = await Movie.find({ status: 'now-showing' });
    const cinemas = await Cinema.find();

    if (movies.length === 0) {
      console.log('❌ Không tìm thấy phim nào đang chiếu');
      return;
    }

    if (cinemas.length === 0) {
      console.log('❌ Không tìm thấy rạp nào');
      return;
    }

    console.log(`📽️  Tìm thấy ${movies.length} phim đang chiếu`);
    console.log(`🏢 Tìm thấy ${cinemas.length} rạp\n`);

    // Khung giờ chiếu phim
    const timeSlots = [
      '09:00', '09:30',
      '11:00', '11:30',
      '13:00', '13:30',
      '15:00', '15:30',
      '17:00', '17:30',
      '19:00', '19:30',
      '21:00', '21:30',
      '23:00'
    ];

    const languages = ['English', 'Vietnamese'];
    const subtitles = ['Vietnamese', 'English', 'None'];
    const prices = [50000, 60000, 70000, 80000, 100000]; // VND

    let totalShowtimes = 0;
    const showtimesToInsert = [];

    // Tạo showtimes cho 5 ngày tới
    for (let day = 0; day < 5; day++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);

      const dateStr = currentDate.toISOString().split('T')[0];
      console.log(`\n📅 Tạo showtimes cho ngày ${dateStr}:`);

      // Mỗi rạp
      for (const cinema of cinemas) {
        if (!cinema.rooms || cinema.rooms.length === 0) {
          console.log(`   ⚠️  Rạp ${cinema.name} không có phòng`);
          continue;
        }

        // Mỗi phòng trong rạp
        for (const room of cinema.rooms) {
          // Chọn ngẫu nhiên 3-5 phim cho mỗi phòng mỗi ngày
          const moviesForRoom = [...movies]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 3);

          // Tạo showtimes cho mỗi phim
          for (const movie of moviesForRoom) {
            // Chọn ngẫu nhiên 2-4 khung giờ
            const selectedTimeSlots = [...timeSlots]
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.floor(Math.random() * 3) + 2);

            for (const timeSlot of selectedTimeSlots) {
              const [hours, minutes] = timeSlot.split(':');
              const startTime = new Date(currentDate);
              startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

              // Tính end_time dựa trên duration của phim
              const endTime = new Date(startTime);
              endTime.setMinutes(endTime.getMinutes() + movie.duration + 15); // +15 phút dọn dẹp

              // Kiểm tra trùng lịch trong cùng phòng
              const hasConflict = showtimesToInsert.some(st => 
                st.cinema_id === cinema._id &&
                st.room_id === room._id &&
                st.date === dateStr &&
                (
                  (startTime >= new Date(st.start_time) && startTime < new Date(st.end_time)) ||
                  (endTime > new Date(st.start_time) && endTime <= new Date(st.end_time)) ||
                  (startTime <= new Date(st.start_time) && endTime >= new Date(st.end_time))
                )
              );

              if (hasConflict) {
                continue; // Bỏ qua nếu trùng lịch
              }

              const showtime = {
                _id: generateShowtimeId(),
                cinema_id: cinema._id,
                movie_id: movie._id,
                room_id: room._id,
                room_name: room.name,
                start_time: startTime,
                end_time: endTime,
                date: dateStr,
                time: timeSlot,
                price: prices[Math.floor(Math.random() * prices.length)],
                available_seats: Math.floor(Math.random() * 10) + 20, // 20-30 ghế trống
                total_seats: 30,
                language: languages[Math.floor(Math.random() * languages.length)],
                subtitle: subtitles[Math.floor(Math.random() * subtitles.length)]
              };

              showtimesToInsert.push(showtime);
              totalShowtimes++;
            }
          }
        }
      }

      console.log(`   ✅ Đã tạo ${showtimesToInsert.filter(st => st.date === dateStr).length} showtimes`);
    }

    // Xóa các showtimes cũ (tùy chọn)
    const deleteOld = process.argv.includes('--delete-old');
    if (deleteOld) {
      await Showtime.deleteMany({});
      console.log('\n🗑️  Đã xóa tất cả showtimes cũ');
    }

    // Insert showtimes mới
    if (showtimesToInsert.length > 0) {
      await Showtime.insertMany(showtimesToInsert);
      console.log(`\n✅ Đã thêm thành công ${totalShowtimes} showtimes cho 5 ngày tới!`);
      
      // Thống kê
      console.log('\n📊 Thống kê:');
      for (let day = 0; day < 5; day++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + day);
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = showtimesToInsert.filter(st => st.date === dateStr).length;
        console.log(`   ${dateStr}: ${count} showtimes`);
      }
    } else {
      console.log('\n⚠️  Không có showtimes nào được tạo');
    }

  } catch (error) {
    console.error('❌ Lỗi khi seed showtimes:', error);
  }
};

// Chạy script
const run = async () => {
  await connectDB();
  await seedShowtimes();
  await mongoose.connection.close();
  console.log('\n👋 Đã đóng kết nối database');
  process.exit(0);
};

run();
