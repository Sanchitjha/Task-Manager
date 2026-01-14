const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key only if available
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.log('📧 SendGrid API key not configured, using mock email service');
}

// Email OTP Service using SendGrid
class EmailOTPService {
    // Generate 6-digit OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Generate OTP expiry time (10 minutes from now)
    static generateOTPExpiry() {
        return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    // Send OTP via Email using SendGrid
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
                from: process.env.SENDER_EMAIL || 'noreply@yourdomain.com',
                subject: 'Email Verification Code - The Manager',
                text: `Your verification code is: ${otpCode}. Valid for 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">The Manager</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                            <p>Hello ${userName},</p>
                            
                            <p>Thank you for registering with The Manager! Please use the verification code below to complete your registration:</p>
                            
                            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                                <h2 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h2>
                                <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 14px;">Valid for 10 minutes</p>
                            </div>
                            
                            <p style="color: #6c757d; font-size: 14px;">
                                <strong>Security tip:</strong> Never share this code with anyone. We will never ask for it over the phone or email.
                            </p>
                            
                            <div style="border-top: 1px solid #dee2e6; margin-top: 30px; padding-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
                                <p>If you didn't request this verification, please ignore this email.</p>
                                <p>© 2025 The Manager. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            };

            await sgMail.send(msg);
            console.log(`✅ Email OTP sent successfully to ${email}`);
            
            return { success: true, message: 'OTP sent successfully to your email' };
            
        } catch (error) {
            console.error('❌ Failed to send email OTP:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to send email'
            };
        }
    }

    // Verify OTP format
    static isValidOTPFormat(otp) {
        return /^\d{6}$/.test(otp);
    }

    // Verify email format
    static isValidEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

module.exports = { EmailOTPService };