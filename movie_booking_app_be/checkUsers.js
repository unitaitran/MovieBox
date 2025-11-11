const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking_db';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find();
    
    console.log(`\n📊 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.full_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone_number}`);
      console.log(`  Total Spend: ${user.total_spend || 0}đ`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
