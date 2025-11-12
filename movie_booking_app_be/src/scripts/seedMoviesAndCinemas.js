require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');

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

// Sample movies
const sampleMovies = [
  {
    _id: 'movie001',
    title: 'Avengers: Endgame',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    poster_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    director: 'Anthony Russo, Joe Russo',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    genre: 'Action, Adventure, Sci-Fi',
    language: 'English',
    duration: 181,
    release_date: '2019-04-26',
    age_limit: 13,
    status: 'now-showing',
    rating: 8.4
  },
  {
    _id: 'movie002',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster_url: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page', 'Tom Hardy', 'Marion Cotillard'],
    genre: 'Action, Sci-Fi, Thriller',
    language: 'English',
    duration: 148,
    release_date: '2010-07-16',
    age_limit: 13,
    status: 'now-showing',
    rating: 8.8
  },
  {
    _id: 'movie003',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
    genre: 'Action, Crime, Drama',
    language: 'English',
    duration: 152,
    release_date: '2008-07-18',
    age_limit: 13,
    status: 'now-showing',
    rating: 9.0
  },
  {
    _id: 'movie004',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    genre: 'Adventure, Drama, Sci-Fi',
    language: 'English',
    duration: 169,
    release_date: '2014-11-07',
    age_limit: 13,
    status: 'now-showing',
    rating: 8.6
  },
  {
    _id: 'movie005',
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
    genre: 'Comedy, Drama, Thriller',
    language: 'Korean',
    duration: 132,
    release_date: '2019-05-30',
    age_limit: 16,
    status: 'now-showing',
    rating: 8.6
  },
  {
    _id: 'movie006',
    title: 'Spider-Man: No Way Home',
    description: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.',
    poster_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    director: 'Jon Watts',
    cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Jacob Batalon', 'Jon Favreau'],
    genre: 'Action, Adventure, Sci-Fi',
    language: 'English',
    duration: 148,
    release_date: '2021-12-17',
    age_limit: 13,
    status: 'now-showing',
    rating: 8.3
  }
];

// Sample cinemas
const sampleCinemas = [
  {
    _id: 'cinema001',
    name: 'CGV Vincom Center',
    address: '72 Le Thanh Ton, Ben Nghe Ward, District 1',
    city: 'Ho Chi Minh',
    rating: 4.5,
    rooms: [
      { _id: 'room001', name: 'Screen 1' },
      { _id: 'room002', name: 'Screen 2' },
      { _id: 'room003', name: 'Screen 3' },
      { _id: 'room004', name: 'IMAX' }
    ]
  },
  {
    _id: 'cinema002',
    name: 'Lotte Cinema Diamond Plaza',
    address: '34 Le Duan, Ben Nghe Ward, District 1',
    city: 'Ho Chi Minh',
    rating: 4.3,
    rooms: [
      { _id: 'room005', name: 'Hall 1' },
      { _id: 'room006', name: 'Hall 2' },
      { _id: 'room007', name: 'Hall 3' },
      { _id: 'room008', name: 'Gold Class' }
    ]
  },
  {
    _id: 'cinema003',
    name: 'Galaxy Cinema Nguyen Du',
    address: '116 Nguyen Du, Ben Thanh Ward, District 1',
    city: 'Ho Chi Minh',
    rating: 4.4,
    rooms: [
      { _id: 'room009', name: 'Cinema 1' },
      { _id: 'room010', name: 'Cinema 2' },
      { _id: 'room011', name: 'Cinema 3' }
    ]
  },
  {
    _id: 'cinema004',
    name: 'BHD Star Cineplex',
    address: '3/2 Street, Ward 11, District 10',
    city: 'Ho Chi Minh',
    rating: 4.2,
    rooms: [
      { _id: 'room012', name: 'Theater 1' },
      { _id: 'room013', name: 'Theater 2' },
      { _id: 'room014', name: 'Theater 3' }
    ]
  }
];

// Seed data
const seedData = async () => {
  try {
    console.log('🎬 Bắt đầu seed movies và cinemas...\n');

    // Kiểm tra xem đã có data chưa
    const existingMovies = await Movie.countDocuments();
    const existingCinemas = await Cinema.countDocuments();

    console.log(`📽️  Hiện có ${existingMovies} movies trong database`);
    console.log(`🏢 Hiện có ${existingCinemas} cinemas trong database\n`);

    // Seed movies
    if (existingMovies === 0) {
      await Movie.insertMany(sampleMovies);
      console.log(`✅ Đã thêm ${sampleMovies.length} movies`);
    } else {
      console.log('⚠️  Đã có movies, bỏ qua seed movies (dùng --force để ghi đè)');
    }

    // Seed cinemas
    if (existingCinemas === 0) {
      await Cinema.insertMany(sampleCinemas);
      console.log(`✅ Đã thêm ${sampleCinemas.length} cinemas`);
    } else {
      console.log('⚠️  Đã có cinemas, bỏ qua seed cinemas (dùng --force để ghi đè)');
    }

    // Force mode
    if (process.argv.includes('--force')) {
      await Movie.deleteMany({});
      await Cinema.deleteMany({});
      await Movie.insertMany(sampleMovies);
      await Cinema.insertMany(sampleCinemas);
      console.log('\n✅ Force mode: Đã xóa và thêm lại tất cả data');
    }

    console.log('\n✅ Seed hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
  }
};

// Chạy script
const run = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('\n👋 Đã đóng kết nối database');
  process.exit(0);
};

run();
