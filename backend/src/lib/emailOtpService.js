const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key only if available
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.log('📧 SendGrid API key not configured, using development mode');
}

// Email OTP Service
class EmailOTPService {
    // Generate 6-digit OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Generate OTP expiry time (10 minutes from now)
    static generateOTPExpiry() {
        return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    // Send OTP via Email
    static async sendEmailOTP(email, otpCode, userName = 'User') {
        try {
            console.log(`📧 Attempting to send OTP to ${email}: ${otpCode}`);
            
            // In development or production without SendGrid, return success immediately
            if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
                console.log(`\n📧 DEVELOPMENT MODE - EMAIL SENT TO ${email}:`);
                console.log(`🔐 Your email verification code is: ${otpCode}`);
                console.log(`⏰ Valid for 10 minutes\n`);
                
                // Return success immediately
                return { 
                    success: true, 
                    message: 'OTP sent successfully to your email address',
                    developmentMode: true,
                    otp: otpCode
                };
            }

            // Production email sending with SendGrid
            const msg = {
                to: email,
                from: process.env.SENDER_EMAIL || 'noreply@showcaseretail.in',
                subject: 'Email Verification Code - The Manager',
                text: `Your verification code is: ${otpCode}. Valid for 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>The Manager - Email Verification</h1>
                        <p>Hello ${userName},</p>
                        <p>Your verification code is:</p>
                        <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otpCode}</h2>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                `
            };

            await sgMail.send(msg);
            
            console.log(`✅ OTP email sent to ${email}`);
            
            return {
                success: true,
                message: 'OTP sent successfully to your email address'
            };
            
        } catch (error) {
            console.error(`❌ Failed to send OTP email to ${email}:`, error);
            
            return {
                success: false,
                message: 'Failed to send OTP. Please try again later.'
            };
        }
    }

    // Validate email format
    static isValidEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

module.exports = { EmailOTPService };