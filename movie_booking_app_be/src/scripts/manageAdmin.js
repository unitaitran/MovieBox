require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

// Tạo admin user
const createAdminUser = async (email, password, fullName) => {
  try {
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`⚠️  User ${email} đã tồn tại`);
      
      // Nếu chưa phải admin, promote lên admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ Đã promote ${email} lên admin`);
      } else {
        console.log(`✅ ${email} đã là admin`);
      }
      
      return existingUser;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới với role admin
    const adminUser = await User.create({
      _id: 'admin' + Date.now(),
      full_name: fullName,
      email: email,
      password_hash: hashedPassword,
      phone_number: '0000000000',
      age: 30,
      role: 'admin',
      total_spend: 0,
    });

    console.log(`✅ Đã tạo admin user: ${email}`);
    return adminUser;
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error);
    throw error;
  }
};

// Promote user thành admin bằng email
const promoteToAdmin = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      return;
    }

    if (user.role === 'admin') {
      console.log(`✅ ${email} đã là admin`);
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Đã promote ${email} (${user.full_name}) lên admin`);
  } catch (error) {
    console.error('❌ Lỗi khi promote user:', error);
    throw error;
  }
};

// Danh sách tất cả admins
const listAdmins = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password_hash');
    
    console.log(`\n👑 Danh sách Admin (${admins.length}):`);
    console.log('─'.repeat(80));
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.full_name} (${admin.email})`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Created: ${admin.created_at || admin.createdAt}`);
      console.log();
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách admin:', error);
  }
};

// Main function
const run = async () => {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create':
        // node src/scripts/manageAdmin.js create email@example.com password123 "Full Name"
        if (args.length < 4) {
          console.log('Usage: node src/scripts/manageAdmin.js create <email> <password> <full_name>');
          process.exit(1);
        }
        await createAdminUser(args[1], args[2], args[3]);
        break;

      case 'promote':
        // node src/scripts/manageAdmin.js promote email@example.com
        if (args.length < 2) {
          console.log('Usage: node src/scripts/manageAdmin.js promote <email>');
          process.exit(1);
        }
        await promoteToAdmin(args[1]);
        break;

      case 'list':
        // node src/scripts/manageAdmin.js list
        await listAdmins();
        break;

      default:
        console.log('📋 Admin Management Commands:');
        console.log('');
        console.log('  Create new admin:');
        console.log('    node src/scripts/manageAdmin.js create <email> <password> <full_name>');
        console.log('');
        console.log('  Promote existing user to admin:');
        console.log('    node src/scripts/manageAdmin.js promote <email>');
        console.log('');
        console.log('  List all admins:');
        console.log('    node src/scripts/manageAdmin.js list');
        console.log('');
        console.log('Examples:');
        console.log('  node src/scripts/manageAdmin.js create admin@example.com admin123 "Admin User"');
        console.log('  node src/scripts/manageAdmin.js promote tai05112004@gmail.com');
        console.log('  node src/scripts/manageAdmin.js list');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await mongoose.connection.close();
  console.log('\n👋 Đã đóng kết nối database');
  process.exit(0);
};

run();
