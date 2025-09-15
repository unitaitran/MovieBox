# Movie Booking Backend API

Backend API for Movie Booking Application built with Node.js, Express, and MongoDB.

## Features

- 🔐 User Authentication & Authorization
- 🎬 Movie Management
- 🎫 Booking System
- 💳 Payment Processing
- 🏢 Cinema Management
- 📊 Advanced Search & Filtering
- 🔒 JWT Security
- 📱 RESTful API

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie_booking_app_be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/movie_booking_db
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/movie_booking_db

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Update the connection string in `.env`

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Movies
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get single movie
- `GET /api/v1/movies/search?q=query` - Search movies
- `GET /api/v1/movies/now-showing` - Get now showing movies
- `GET /api/v1/movies/coming-soon` - Get coming soon movies
- `GET /api/v1/movies/genre/:genre` - Get movies by genre

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get single booking
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Delete booking
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

### Payments
- `GET /api/v1/payments` - Get user payments
- `GET /api/v1/payments/:id` - Get single payment
- `POST /api/v1/payments` - Create payment
- `POST /api/v1/payments/:id/process` - Process payment
- `POST /api/v1/payments/:id/refund` - Refund payment

## Database Models

### User
- Personal information (name, email, phone, dateOfBirth)
- Authentication (password, role)
- Preferences (favoriteGenres, loyaltyPoints)
- Account status (isActive)

### Movie
- Basic info (title, description, genre, duration)
- Media (poster, trailer)
- Classification (ageRating, language)
- Showtimes and pricing

### Booking
- User and movie references
- Seat selection
- Showtime details
- Booking status and payment info
- QR code for entry

### Payment
- Transaction details
- Payment method and status
- Gateway integration
- Refund handling

### Cinema
- Location and contact info
- Facilities and amenities
- Screen configurations
- Operating hours

## MongoDB Connection

### Local MongoDB
```javascript
MONGODB_URI=mongodb://localhost:27017/movie_booking_db
```

### MongoDB Atlas (Cloud)
```javascript
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie_booking_db?retryWrites=true&w=majority
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- CORS protection
- Helmet security headers
- Error handling middleware

## Development

```bash
# Start development server with nodemon
npm run dev

# Check health endpoint
curl http://localhost:5000/health
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Set strong JWT_SECRET
4. Configure proper CORS origins
5. Use PM2 for process management

## API Documentation

The API follows RESTful conventions and returns JSON responses with the following structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
