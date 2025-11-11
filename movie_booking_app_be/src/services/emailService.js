const nodemailer = require('nodemailer');

// Function to get SMTP config based on email provider
const getSMTPConfig = (email) => {
  const domain = email.split('@')[1].toLowerCase();
  
  switch (domain) {
    case 'fpt.edu.vn':
      return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    
    case 'gmail.com':
      return {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    
    case 'outlook.com':
    case 'hotmail.com':
      return {
        service: 'outlook',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    
    default:
      // Generic SMTP config
      return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
  }
};

// Create transporter based on email provider
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  if (!emailUser) {
    throw new Error('EMAIL_USER not configured');
  }
  
  console.log('Email User:', emailUser);
  const config = getSMTPConfig(emailUser);
  console.log('SMTP Config:', JSON.stringify(config, null, 2));
  
  return nodemailer.createTransport(config);
};

// Send OTP Email
const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Movie Booking App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Registration Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e50914; margin: 0; font-size: 28px;">🎬 Movie Booking</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">Hello ${fullName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                Thank you for registering with Movie Booking App. Please use the verification code below to complete your registration:
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #e50914, #ff6b6b); color: white; font-size: 32px; font-weight: bold; padding: 20px 40px; border-radius: 10px; display: inline-block; letter-spacing: 5px; box-shadow: 0 4px 15px rgba(229,9,20,0.3);">
                ${otp}
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                ⚠️ This verification code will expire in <strong>5 minutes</strong>
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                If you didn't request this verification code, please ignore this email.<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (email, fullName, userId) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Movie Booking App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Movie Booking App! 🎬',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e50914; margin: 0; font-size: 28px;">🎬 Movie Booking</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">Welcome ${fullName}! 🎉</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                Congratulations! Your account has been successfully created. You can now enjoy booking your favorite movies.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Account Details:</h3>
              <p style="color: #666; margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Rank:</strong> Bronze</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 16px;">Start exploring amazing movies now!</p>
              <a href="#" style="background: linear-gradient(135deg, #e50914, #ff6b6b); color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; display: inline-block;">
                Browse Movies
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Thank you for choosing Movie Booking App!<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};