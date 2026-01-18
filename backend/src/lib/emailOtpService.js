const sgMail = require('@sendgrid/mail');

// Set SendGrid API key from environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailOTPService {
  static isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateOTPExpiry(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isOTPExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }

  static async sendEmailOTP(email, otp, purpose = 'Authentication') {
    try {
      // Check if SendGrid is configured
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured, running in development mode');
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Development Mode: OTP is ${otp}`
        };
      }

      // Email template
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL || 'noreply@showcaseretail.in', // Your verified sender
        subject: `${purpose} - OTP Verification`,
        text: `Your OTP for ${purpose} is: ${otp}. This OTP is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">OTP Verification</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello,<br><br>
                Your OTP for <strong>${purpose}</strong> is:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; font-family: monospace;">
                  ${otp}
                </span>
              </div>
              
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this OTP, please ignore this email.<br>
                  This is an automated message, please do not reply.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      
      return {
        success: true,
        message: 'OTP sent successfully'
      };

    } catch (error) {
      console.error('Email sending error:', error);
      
      // In development, return the OTP even if email fails
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Development Mode: Email failed but OTP is ${otp}`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async verifyOTP(email, otp) {
    // This is a simple implementation - in a real app you'd check against stored OTPs
    // For now, we'll rely on the User model fields for OTP verification
    const { User } = require('../schemas/User');
    
    try {
      const user = await User.findOne({ 
        email,
        emailOtpCode: otp,
        emailOtpExpiry: { $gt: new Date() }
      });
      
      return !!user;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  }
}

module.exports = { EmailOTPService, emailOtpService: EmailOTPService };