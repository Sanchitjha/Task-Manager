const { Resend } = require('resend');

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

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
      // If Resend not configured, run in development mode
      if (!resend) {
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Development Mode: OTP is ${otp}`
        };
      }

      const { data, error } = await resend.emails.send({
        from: `The Manager <${FROM_EMAIL}>`,
        to: [email],
        subject: `${purpose} - OTP Verification | The Manager`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">The MANAGER</h1>
                <p style="color: #888; font-size: 13px; margin: 5px 0 0;">Structured Social Management Service</p>
              </div>

              <h2 style="color: #333; text-align: center; margin-bottom: 20px;">OTP Verification</h2>

              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello,<br><br>
                Your OTP for <strong>${purpose}</strong> is:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 10px; font-family: monospace;">
                  ${otp}
                </span>
              </div>

              <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                This OTP is valid for <strong>10 minutes</strong>.<br>Please do not share this code with anyone.
              </p>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this OTP, please ignore this email.<br>
                  This is an automated message, please do not reply.
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend email error:', error);
        // Development fallback
        if (process.env.NODE_ENV !== 'production') {
          return {
            success: true,
            developmentMode: true,
            otp: otp,
            message: `Dev fallback: OTP is ${otp}`
          };
        }
        return { success: false, error: error.message };
      }

      return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
      console.error('Email sending error:', error);

      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          developmentMode: true,
          otp: otp,
          message: `Dev fallback: OTP is ${otp}`
        };
      }

      return { success: false, error: error.message };
    }
  }

  static async verifyOTP(email, otp) {
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
