const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, password_hash } = req.body;
    const userPassword = password || password_hash;
    
    // Validation
    const errors = [];
    
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
    else if (!email.includes('@')) {
      errors.push({ field: 'email', message: 'Email phải chứa ký tự @' });
    }
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    }
    
    if (!userPassword) errors.push({ field: 'password', message: 'Mật khẩu không được để trống' });
    else if (userPassword.length < 6) {
      errors.push({ field: 'password', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu nhập không hợp lệ',
        errors: errors
      });
    }

    const user = await User.findOne({ email }).select('+password_hash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email không tồn tại trong hệ thống'
      });
    }

    // Compare password directly (no hashing)
    if (user.password_hash !== userPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác'
      });
    }

    const token = user.generateAuthToken();
    user.password_hash = undefined;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user, token }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// @desc    Send OTP for registration
// @route   POST /api/v1/users/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { email, full_name, age, phone_number, password_hash } = req.body;

    // Detailed validation with specific error messages
    const errors = [];
    
    // Email validation
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
    else if (!email.includes('@')) {
      errors.push({ field: 'email', message: 'Email phải chứa ký tự @' });
    }
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    }
    
    // Full name validation
    if (!full_name) errors.push({ field: 'full_name', message: 'Tên không được để trống' });
    else if (full_name.trim().length < 2 || full_name.trim().length > 50) {
      errors.push({ field: 'full_name', message: 'Tên phải có từ 2 đến 50 ký tự' });
    }
    else if (/\d/.test(full_name.trim())) {
      errors.push({ field: 'full_name', message: 'Tên không được chứa số' });
    }
    
    // Age validation
    if (!age) errors.push({ field: 'age', message: 'Tuổi không được để trống' });
    else if (isNaN(age) || age < 1 || age > 120) {
      errors.push({ field: 'age', message: 'Tuổi phải là số từ 1 đến 120' });
    }
    
    // Phone number validation
    if (!phone_number) errors.push({ field: 'phone_number', message: 'Số điện thoại không được để trống' });
    else if (!/^0\d{9}$/.test(phone_number)) {
      errors.push({ field: 'phone_number', message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0' });
    }
    
    // Password validation
    if (!password_hash) errors.push({ field: 'password_hash', message: 'Mật khẩu không được để trống' });
    else if (password_hash.length < 6) {
      errors.push({ field: 'password_hash', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu nhập không hợp lệ',
        errors: errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      otp,
      userData: {
        email,
        full_name,
        age,
        phone_number,
        password_hash
      },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0
    });

    await otpRecord.save();

    // Send OTP email
    await sendOTPEmail(email, otp, full_name);

    res.json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn',
      data: {
        email,
        expiresIn: '5 phút'
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Handle email sending errors
    if (error.message && error.message.includes('EMAIL_USER')) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình dịch vụ email',
        errors: [{ field: 'email', message: 'Không thể gửi email lúc này' }]
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Gửi OTP thất bại',
      errors: [{ field: 'server', message: 'Lỗi server' }]
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/v1/users/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Detailed validation
    const errors = [];
    
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
    else if (!email.includes('@')) {
      errors.push({ field: 'email', message: 'Email phải chứa ký tự @' });
    }
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    }
    
    if (!otp) errors.push({ field: 'otp', message: 'Mã OTP không được để trống' });
    else if (!/^\d{6}$/.test(otp)) {
      errors.push({ field: 'otp', message: 'Mã OTP phải là 6 chữ số' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu nhập không hợp lệ',
        errors: errors
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy OTP hoặc OTP đã hết hạn'
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn'
      });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: 'Đã nhập sai quá nhiều lần. Vui lòng yêu cầu OTP mới'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({
        success: false,
        message: `Mã OTP không chính xác. Còn lại ${3 - otpRecord.attempts} lần thử`
      });
    }

    // Generate new user ID
    const lastUser = await User.findOne().sort({ _id: -1 });
    let newId = 'u001';
    if (lastUser && lastUser._id) {
      const lastIdNumber = parseInt(lastUser._id.substring(1));
      const nextIdNumber = lastIdNumber + 1;
      newId = 'u' + nextIdNumber.toString().padStart(3, '0');
    }

    // Create new user
    const newUser = new User({
      _id: newId,
      email: email,
      full_name: otpRecord.userData.full_name,
      age: otpRecord.userData.age,
      phone_number: otpRecord.userData.phone_number,
      password_hash: otpRecord.userData.password_hash,
      rank: 'Bronze',
      total_spend: 0,
      status: 'Active'
    });

    await newUser.save();

    // Delete OTP record
    await OTP.deleteOne({ email });

    // Generate token
    const token = newUser.generateAuthToken();

    // Remove password_hash from response
    newUser.password_hash = undefined;

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = [];
      for (let field in error.errors) {
        validationErrors.push({
          field: field,
          message: error.errors[field].message
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu người dùng không hợp lệ',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký',
        errors: [{ field: 'email', message: 'Địa chỉ email đã tồn tại' }]
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Xác thực OTP thất bại',
      errors: [{ field: 'server', message: 'Lỗi server' }]
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/v1/users/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Detailed validation
    const errors = [];
    
    if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
    else if (!email.includes('@')) {
      errors.push({ field: 'email', message: 'Email phải chứa ký tự @' });
    }
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu nhập không hợp lệ',
        errors: errors
      });
    }

    // Find existing OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký nào cho email này'
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP record
    otpRecord.otp = newOtp;
    otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    otpRecord.attempts = 0; // Reset attempts
    await otpRecord.save();

    // Send new OTP email
    await sendOTPEmail(email, newOtp, otpRecord.userData.full_name);

    res.json({
      success: true,
      message: 'Mã OTP mới đã được gửi đến email của bạn',
      data: {
        email,
        expiresIn: '5 phút'
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    
    // Handle email sending errors  
    if (error.message && error.message.includes('EMAIL_USER')) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình dịch vụ email',
        errors: [{ field: 'email', message: 'Không thể gửi email lúc này' }]
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Gửi lại OTP thất bại',
      errors: [{ field: 'server', message: 'Lỗi server' }]
    });
  }
};

const getProfile = (req, res) => {
  res.status(501).json({ message: 'Chưa được triển khai' });
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, age, phone_number, profile_image } = req.body;
    const userId = req.user.userId; // Get userId from JWT token

    // Validation
    const errors = [];
    
    if (full_name !== undefined) {
      if (!full_name.trim()) {
        errors.push({ field: 'full_name', message: 'Full name cannot be empty' });
      } else if (full_name.trim().length < 2 || full_name.trim().length > 50) {
        errors.push({ field: 'full_name', message: 'Full name must be between 2 and 50 characters' });
      } else if (/\d/.test(full_name.trim())) {
        errors.push({ field: 'full_name', message: 'Full name cannot contain numbers' });
      }
    }
    
    if (age !== undefined) {
      if (isNaN(age) || age < 1 || age > 120) {
        errors.push({ field: 'age', message: 'Age must be between 1 and 120' });
      }
    }
    
    if (phone_number !== undefined) {
      if (!phone_number.trim()) {
        errors.push({ field: 'phone_number', message: 'Phone number cannot be empty' });
      } else if (!/^0\d{9}$/.test(phone_number.trim())) {
        errors.push({ field: 'phone_number', message: 'Phone number must be 10 digits starting with 0' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors
      });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only provided fields
    if (full_name !== undefined) user.full_name = full_name.trim();
    if (age !== undefined) user.age = age;
    if (phone_number !== undefined) user.phone_number = phone_number.trim();
    if (profile_image !== undefined) user.profile_image = profile_image;

    await user.save();

    // Remove password_hash from response
    user.password_hash = undefined;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = [];
      for (let field in error.errors) {
        validationErrors.push({
          field: field,
          message: error.errors[field].message
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

const forgotPassword = (req, res) => {
  res.status(501).json({ message: 'Chưa được triển khai' });
};

const resetPassword = (req, res) => {
  res.status(501).json({ message: 'Chưa được triển khai' });
};

// @desc    Get current OTP (FOR TESTING ONLY)
// @route   GET /api/v1/users/get-otp/:email
// @access  Public (REMOVE IN PRODUCTION)
const getCurrentOTP = async (req, res) => {
  try {
    const { email } = req.params;
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy OTP cho email này'
      });
    }

    res.json({
      success: true,
      data: {
        email,
        otp: otpRecord.otp,
        expiresAt: otpRecord.expiresAt,
        attempts: otpRecord.attempts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy OTP'
    });
  }
};

module.exports = {
  sendOTP, 
  verifyOTP, 
  resendOTP, 
  login, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  getCurrentOTP
};