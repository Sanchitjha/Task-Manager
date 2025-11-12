const crypto = require('crypto');

// OTP Service - In production, integrate with Twilio, AWS SNS, etc.
class OTPService {
    // Generate 6-digit OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Generate OTP expiry time (5 minutes from now)
    static generateOTPExpiry() {
        return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    }

    // Send OTP via SMS (Mock implementation for development)
    static async sendOTP(phoneNumber, otpCode) {
        try {
            // Mock SMS sending - In production, integrate with:
            // - Twilio: https://www.twilio.com/
            // - AWS SNS: https://aws.amazon.com/sns/
            // - Firebase: https://firebase.google.com/docs/auth/android/phone-auth
            // - MSG91: https://msg91.com/
            
            console.log(`📱 MOCK SMS SENT TO ${phoneNumber}:`);
            console.log(`🔐 Your verification code is: ${otpCode}`);
            console.log(`⏰ Valid for 5 minutes`);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return { success: true, message: 'OTP sent successfully' };
            
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP format
    static isValidOTPFormat(otp) {
        return /^\d{6}$/.test(otp);
    }

    // Verify phone number format (basic validation)
    static isValidPhoneFormat(phone) {
        // Accept formats: +1234567890, 1234567890, +91-9876543210, etc.
        const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?\d{10,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Normalize phone number
    static normalizePhone(phone) {
        // Remove all non-digit characters except +
        const cleaned = phone.replace(/[^\d+]/g, '');
        
        // If doesn't start with +, assume it's a local number
        if (!cleaned.startsWith('+')) {
            return '+' + cleaned;
        }
        
        return cleaned;
    }

    // Check if OTP is expired
    static isOTPExpired(expiryTime) {
        return new Date() > expiryTime;
    }

    // Rate limiting for OTP requests
    static canRequestOTP(lastRequestTime, cooldownMinutes = 1) {
        if (!lastRequestTime) return true;
        
        const cooldownMs = cooldownMinutes * 60 * 1000;
        return (Date.now() - lastRequestTime.getTime()) > cooldownMs;
    }
}

module.exports = { OTPService };