const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');
const bookingRoutes = require('./routes/booking.routes');
const cinemaRoutes = require('./routes/cinema.routes');
const showtimeRoutes = require('./routes/showtime.routes'); // Thêm route cho showtime
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, check whitelist
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:8082',
      ];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`\n${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('⚠️  Request body is empty or undefined');
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Movie Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/showtimes', showtimeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// // Debug log for registered routes
// console.log('Routes registered:', {
//   auth: '/api/v1/auth',
//   movies: '/api/v1/movies',
//   bookings: '/api/v1/bookings',
//   cinemas: '/api/v1/cinemas',
//   showtimes: '/api/v1/showtimes'
// });

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Movie Booking API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      movies: '/api/v1/movies',
      bookings: '/api/v1/bookings',
      cinemas: '/api/v1/cinemas',
      showtimes: '/api/v1/showtimes'
    }
  });
});

// 404 handler with debug log
app.use('*', (req, res) => {
  console.log('404 Route not found:', req.originalUrl);
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🎬 API Base URL: http://localhost:${PORT}/api/v1`);
});