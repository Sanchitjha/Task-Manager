const admin = require('firebase-admin');

let firebaseInitialized = false;

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('⚠️  Firebase not configured - Phone OTP will run in development mode');
      return;
    }

    // Initialize with service account credentials from environment
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️  Phone OTP will run in development mode');
  }
}

class PhoneOTPService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateOTPExpiry(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isOTPExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }

  static validatePhoneNumber(phone) {
    // Remove spaces, dashes, and other formatting
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid format (starts with + and has 10-15 digits)
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    
    if (!phoneRegex.test(cleaned)) {
      // Try to fix common issues
      if (/^\d{10}$/.test(cleaned)) {
        // Indian number without country code
        return '+91' + cleaned;
      }
      return null;
    }
    
    return cleaned;
  }

  static async sendPhoneOTP(phoneNumber, otp) {
    try {
      // Validate phone number format
      const validPhone = this.validatePhoneNumber(phoneNumber);
      if (!validPhone) {
        return {
          success: false,
          error: 'Invalid phone number format. Use international format: +919876543210'
        };
      }

      // Check if Firebase is initialized
      if (!firebaseInitialized) {
        console.log('Firebase not configured, running in development mode');
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Development Mode: Your OTP is ${otp}`,
          phone: validPhone
        };
      }

      // In production, Firebase would handle SMS sending via Firebase Authentication
      // However, for server-side OTP generation, we'll use a custom implementation
      // or a third-party SMS service integrated with Firebase
      
      // For now, return development mode
      // TODO: Integrate with Firebase Cloud Messaging or third-party SMS provider
      console.log(`📱 Phone OTP would be sent to ${validPhone}: ${otp}`);
      
      return {
        success: true,
        developmentMode: true,
        otp: otp,
        message: `Development Mode: Your OTP is ${otp}`,
        phone: validPhone
      };

    } catch (error) {
      console.error('Phone OTP sending error:', error);
      
      // In development, still return the OTP
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Development Mode: Your OTP is ${otp}`,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async verifyPhoneOTP(phoneNumber, otp) {
    // This is handled by checking against stored OTPs in User model
    const { User } = require('../schemas/User');
    
    try {
      const validPhone = this.validatePhoneNumber(phoneNumber);
      if (!validPhone) {
        return false;
      }

      const user = await User.findOne({ 
        phone: validPhone,
        phoneOtpCode: otp,
        phoneOtpExpiry: { $gt: new Date() }
      });
      
      return !!user;
    } catch (error) {
      console.error('Phone OTP verification error:', error);
      return false;
    }
  }
}

// Initialize Firebase on module load
initializeFirebase();

module.exports = { PhoneOTPService, initializeFirebase };
