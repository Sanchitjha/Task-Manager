const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth, adminOnly } = require('../middleware/auth');
const { EmailOTPService } = require('../lib/emailOtpService');
const { PhoneOTPService } = require('../lib/firebaseService');

const router = express.Router();

// Send Email OTP for registration
router.post('/send-email-otp', async (req, res, next) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ message: 'Email address is required' });
		}
		
		// Validate email format
		if (!EmailOTPService.isValidEmailFormat(email)) {
			return res.status(400).json({ message: 'Invalid email address format' });
		}
		
		// Check if email already exists and is verified
		const existingUser = await User.findOne({ email, isEmailVerified: true });
		if (existingUser) {
			return res.status(400).json({ message: 'Email address already registered and verified' });
		}
		
		// Generate OTP
		const otpCode = EmailOTPService.generateOTP();
		const otpExpiry = EmailOTPService.generateOTPExpiry();
		
		// Find or create temporary user record for OTP
		let tempUser = await User.findOne({ email, isEmailVerified: false });
		
		if (tempUser) {
			// Update existing temp record
			tempUser.emailOtpCode = otpCode;
			tempUser.emailOtpExpiry = otpExpiry;
			tempUser.emailOtpAttempts = 0;
			await tempUser.save();
		} else {
			// Create new temp record (will be completed after OTP verification)
			tempUser = await User.create({
				name: 'Temp User', // Will be updated during registration
				email,
				password: 'temp', // Temporary password
				isEmailVerified: false,
				emailOtpCode: otpCode,
				emailOtpExpiry: otpExpiry,
				emailOtpAttempts: 0
			});
		}
		
		// Send Email OTP
		const otpResult = await EmailOTPService.sendEmailOTP(email, otpCode, 'New User');
		
		if (otpResult.success) {
			// Response object
			const response = {
				success: true,
				message: 'OTP sent successfully to your email address',
				email: email,
				expiresIn: '10 minutes'
			};
			
			// Include OTP in development mode
			if (otpResult.developmentMode) {
				response.developmentOTP = otpResult.otp;
				response.developmentMessage = `Development Mode: Your OTP is ${otpResult.otp}`;
			}
			
			res.json(response);
		} else {
			res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP. Please try again.' 
			});
		}
		
	} catch (error) {
		console.error('Send Email OTP error:', error);
		next(error);
	}
});

// Verify Email OTP and complete registration
router.post('/verify-email-otp-register', async (req, res, next) => {
	try {
		const { email, otp, name, password, phone, role } = req.body;
		
		// Validate required fields
		if (!email || !otp || !name || !password) {
			return res.status(400).json({ 
				message: 'Email, OTP, name, and password are required' 
			});
		}
		
		// Only allow user or Partner registration through public route
		if (role && role !== 'user' && role !== 'Partner') {
			return res.status(403).json({ message: 'Only users or Partners can register publicly' });
		}
		
		// Find user with this email
		const user = await User.findOne({ email, isEmailVerified: false });
		
		if (!user) {
			return res.status(400).json({ 
				message: 'No OTP request found for this email. Please request a new OTP.' 
			});
		}
		
		// Check if OTP expired
		if (EmailOTPService.isOTPExpired(user.emailOtpExpiry)) {
			return res.status(400).json({ 
				message: 'OTP has expired. Please request a new OTP.' 
			});
		}
		
		// Check OTP attempts
		if (user.emailOtpAttempts >= 5) {
			return res.status(400).json({ 
				message: 'Too many failed attempts. Please request a new OTP.' 
			});
		}
		
		// Verify OTP
		if (user.emailOtpCode !== otp) {
			user.emailOtpAttempts += 1;
			await user.save();
			
			return res.status(400).json({ 
				message: `Invalid OTP. ${5 - user.emailOtpAttempts} attempts remaining.` 
			});
		}
		
		// OTP verified! Complete the registration
		const hash = await bcrypt.hash(password, 10);
		
		user.name = name;
		user.password = hash;
		user.phone = phone || null; // Optional phone number
	// Assign role: Partner if requested, otherwise user
	user.role = role === 'Partner' ? 'Partner' : 'user';
		user.isApproved = true;
		user.isEmailVerified = true;
		user.emailOtpCode = undefined;
		user.emailOtpExpiry = undefined;
		user.emailOtpAttempts = 0;
		
		await user.save();
		
		res.json({ 
			success: true,
			message: 'Registration completed successfully! Email verified.',
			userId: user._id 
		});
		
	} catch (error) {
		console.error('Verify Email OTP error:', error);
		next(error);
	}
});

// Register new user (public - only for users)
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, phone, role } = req.body;
		
		// Validate required fields
		if (!name || !email || !password || !phone || !role) {
			return res.status(400).json({ message: 'Name, email, password, phone, and role are required' });
		}
		
		// Normalize role to handle case variations
		const normalizedRole = role === 'partner' ? 'Partner' : role;
		
		// Validate role
		if (!['user', 'Partner', 'subadmin'].includes(normalizedRole)) {
			return res.status(400).json({ message: 'Invalid role. Must be user, Partner, or subadmin' });
		}
		
		// Only allow user and Partner registration through public route
		if (normalizedRole && normalizedRole !== 'user' && normalizedRole !== 'Partner') {
			return res.status(403).json({ message: 'Only users or Partners can register publicly' });
		}
		
		// Check if email already exists
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		// Hash password and create user
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash,
			phone,
			role: normalizedRole,
			isApproved: normalizedRole === 'subadmin' ? false : true  // Sub-admins need approval
		});
		
		res.json({ id: user._id, message: 'Registration successful' });
	} catch (e) { 
		next(e); 
	}
});

// Register sub-admin (requires approval)
router.post('/register-subadmin', async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash, 
			role: 'subadmin',
			isApproved: false // Requires admin approval
		});
		
		res.json({ 
			id: user._id, 
			message: 'Sub-admin registration submitted. Please wait for admin approval.' 
		});
	} catch (e) { 
		next(e); 
	}
});

// Register admin (only existing admins can create new admins, OR if no admins exist yet)
router.post('/register-admin', async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		// Check if any admins exist
		const adminCount = await User.countDocuments({ role: 'admin' });
		
		// If admins exist, require authentication
		if (adminCount > 0) {
			// Check if user is authenticated and is an admin
			const token = req.headers.authorization?.split(' ')[1];
			if (!token) {
				return res.status(401).json({ message: 'Admin authentication required to create new admins' });
			}
			
			const jwt = require('jsonwebtoken');
			let decoded;
			try {
				decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
			} catch (err) {
				return res.status(401).json({ message: 'Invalid authentication token' });
			}
			
			const requestingUser = await User.findById(decoded.id);
			if (!requestingUser || requestingUser.role !== 'admin') {
				return res.status(403).json({ message: 'Only admins can create new admins' });
			}
		}
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash, 
			role: 'admin',
			isApproved: true 
		});
		
		res.json({ 
			id: user._id, 
			message: adminCount === 0 ? 'First admin created successfully' : 'Admin created successfully' 
		});
	} catch (e) { 
		next(e); 
	}
});

// Login user
router.post('/login', async (req, res, next) => {
	console.log('=== LOGIN ROUTE HIT ===');
	console.log('Request body:', req.body);
	try {
		const { email, password } = req.body;
		console.log('🔐 Login attempt:', { email, passwordLength: password?.length });
		
		const user = await User.findOne({ email });
		console.log('👤 User found:', !!user, user ? { id: user._id, role: user.role, hasPassword: !!user.password } : null);
		if (!user) {
			console.log('❌ User not found, returning 401');
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		const ok = await bcrypt.compare(password, user.password);
		console.log('🔑 Password comparison result:', ok);
		if (!ok) {
			console.log('❌ Password mismatch, returning 401');
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		// Check if sub-admin is approved
		if (user.role === 'subadmin' && !user.isApproved) {
			return res.status(403).json({ 
				message: 'Your sub-admin account is pending approval. Please contact an administrator.' 
			});
		}
		
		const token = jwt.sign(
			{ 
				id: user._id.toString(),
				role: user.role,
				email: user.email,
				name: user.name
			}, 
			process.env.JWT_SECRET || 'dev',
			{ expiresIn: '24h' }
		);
		
		// Send user data without password
		const userData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			isEmailVerified: user.isEmailVerified || false,
			role: user.role,
			profileImage: user.profileImage,
			coinsBalance: user.coinsBalance || 0,
			walletBalance: user.walletBalance || 0,
			isApproved: user.isApproved
		};
		
		// Send response with token and user data
		res.json({
			token,
			user: userData
		});
	} catch (e) { 
		next(e); 
	}
});

router.post('/logout', auth, async (req, res, next) => {
	try {
		
		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict'
		});
		
		res.json({ message: 'Logged out successfully' });
	} catch (e) { 
		next(e); 
	}
});

// Send Email OTP for partner registration
router.post('/send-partner-email-otp', async (req, res, next) => {
	try {
		const { email } = req.body;
		
		// Validate email
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}
		
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: 'Invalid email format' });
		}
		
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists with this email' });
		}
		
		// Generate OTP
		const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		// Store OTP temporarily - Create temporary user record
		let tempUser = await User.findOne({ email, role: 'temp-partner' });
		
		if (tempUser) {
			// Update existing temp user
			tempUser.emailOtpCode = otpCode;
			tempUser.emailOtpExpiry = otpExpiry;
			tempUser.emailOtpAttempts = 0;
			await tempUser.save();
		} else {
			// Create new temp user
			tempUser = await User.create({
				name: 'Temporary Partner',
				email,
				phone: 'temp',
				password: 'temp',
				role: 'temp-partner',
				emailOtpCode: otpCode,
				emailOtpExpiry: otpExpiry,
				emailOtpAttempts: 0,
				isEmailVerified: false
			});
		}
		
		// Send Email OTP
		const otpResult = await EmailOTPService.sendEmailOTP(email, otpCode, 'Partner Registration');
		
		if (otpResult.success) {
			// Response object
			const response = {
				success: true,
				message: 'OTP sent successfully to your email address for partner registration',
				email: email,
				expiresIn: '10 minutes'
			};
			
			// Include OTP in development mode
			if (otpResult.developmentMode) {
				response.developmentOTP = otpResult.otp;
				response.developmentMessage = `Development Mode: Your OTP is ${otpResult.otp}`;
			}
			
			res.json(response);
		} else {
			res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP. Please try again.' 
			});
		}
		
	} catch (error) {
		console.error('Send Partner Email OTP error:', error);
		next(error);
	}
});

// Verify Email OTP for partner registration
router.post('/verify-partner-otp', async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		
		// Validate required fields
		if (!email || !otp) {
			return res.status(400).json({ 
				message: 'Email and OTP are required' 
			});
		}
		
		// Find temp user
		const tempUser = await User.findOne({ 
			email,
			role: 'temp-partner'
		});
		
		if (!tempUser) {
			return res.status(400).json({ 
				message: 'Invalid email or OTP session expired' 
			});
		}
		
		// Check OTP expiry
		if (new Date() > tempUser.emailOtpExpiry) {
			await User.deleteOne({ email, role: 'temp-partner' });
			return res.status(400).json({ 
				message: 'OTP has expired. Please request a new one.' 
			});
		}
		
		// Check OTP attempts
		if (tempUser.emailOtpAttempts >= 3) {
			await User.deleteOne({ email, role: 'temp-partner' });
			return res.status(400).json({ 
				message: 'Too many failed attempts. Please request a new OTP.' 
			});
		}
		
		// Verify OTP
		if (tempUser.emailOtpCode !== otp) {
			tempUser.emailOtpAttempts += 1;
			await tempUser.save();
			return res.status(400).json({ 
				message: 'Invalid OTP. Please try again.' 
			});
		}
		
		// Mark as verified
		tempUser.isEmailVerified = true;
		await tempUser.save();
		
		res.json({ 
			success: true, 
			message: 'Email verified successfully. You can now complete partner registration.',
			verificationToken: tempUser._id.toString() // Use temp user ID as token
		});
		
	} catch (error) {
		console.error('Verify Partner Email OTP error:', error);
		next(error);
	}
});

// Send Phone OTP for registration
router.post('/send-phone-otp', async (req, res, next) => {
	try {
		const { phone } = req.body;
		
		if (!phone) {
			return res.status(400).json({ message: 'Phone number is required' });
		}
		
		// Validate phone number format
		const validPhone = PhoneOTPService.validatePhoneNumber(phone);
		if (!validPhone) {
			return res.status(400).json({ 
				message: 'Invalid phone number format. Use international format: +919876543210' 
			});
		}
		
		// Check if phone already exists and is verified
		const existingUser = await User.findOne({ phone: validPhone, isPhoneVerified: true });
		if (existingUser) {
			return res.status(400).json({ message: 'Phone number already registered and verified' });
		}
		
		// Generate OTP
		const otpCode = PhoneOTPService.generateOTP();
		const otpExpiry = PhoneOTPService.generateOTPExpiry(10);
		
		// Find or create temporary user record for OTP
		let tempUser = await User.findOne({ phone: validPhone, isPhoneVerified: false });
		
		if (tempUser) {
			// Update existing temp record
			tempUser.phoneOtpCode = otpCode;
			tempUser.phoneOtpExpiry = otpExpiry;
			tempUser.phoneOtpAttempts = 0;
			await tempUser.save();
		} else {
			// Create new temp record
			tempUser = await User.create({
				name: 'Temp User',
				email: `temp_${Date.now()}@temp.com`,
				password: 'temp',
				phone: validPhone,
				isPhoneVerified: false,
				isEmailVerified: false,
				phoneOtpCode: otpCode,
				phoneOtpExpiry: otpExpiry,
				phoneOtpAttempts: 0
			});
		}
		
		// Send Phone OTP
		const otpResult = await PhoneOTPService.sendPhoneOTP(validPhone, otpCode);
		
		if (otpResult.success) {
			const response = {
				success: true,
				message: 'OTP sent successfully to your phone number',
				phone: validPhone,
				expiresIn: '10 minutes'
			};
			
			// Include OTP in development mode
			if (otpResult.developmentMode) {
				response.developmentOTP = otpResult.otp;
				response.developmentMessage = `Development Mode: Your OTP is ${otpResult.otp}`;
			}
			
			res.json(response);
		} else {
			res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP. Please try again.' 
			});
		}
		
	} catch (error) {
		console.error('Send Phone OTP error:', error);
		next(error);
	}
});

// Verify Phone OTP and complete registration
router.post('/verify-phone-otp-register', async (req, res, next) => {
	try {
		const { phone, otp, name, email, password, role } = req.body;
		
		// Validate required fields
		if (!phone || !otp || !name || !password) {
			return res.status(400).json({ 
				message: 'Phone, OTP, name, and password are required' 
			});
		}
		
		// Validate phone format
		const validPhone = PhoneOTPService.validatePhoneNumber(phone);
		if (!validPhone) {
			return res.status(400).json({ 
				message: 'Invalid phone number format' 
			});
		}
		
		// Only allow user or Partner registration through public route
		if (role && role !== 'user' && role !== 'Partner') {
			return res.status(403).json({ message: 'Only users or Partners can register publicly' });
		}
		
		// Find user with this phone
		const user = await User.findOne({ phone: validPhone, isPhoneVerified: false });
		
		if (!user) {
			return res.status(400).json({ 
				message: 'No OTP request found for this phone. Please request a new OTP.' 
			});
		}
		
		// Check if OTP expired
		if (PhoneOTPService.isOTPExpired(user.phoneOtpExpiry)) {
			return res.status(400).json({ 
				message: 'OTP has expired. Please request a new OTP.' 
			});
		}
		
		// Check OTP attempts
		if (user.phoneOtpAttempts >= 5) {
			return res.status(400).json({ 
				message: 'Too many failed attempts. Please request a new OTP.' 
			});
		}
		
		// Verify OTP
		if (user.phoneOtpCode !== otp) {
			user.phoneOtpAttempts += 1;
			await user.save();
			
			return res.status(400).json({ 
				message: `Invalid OTP. ${5 - user.phoneOtpAttempts} attempts remaining.` 
			});
		}
		
		// OTP verified! Complete the registration
		const hash = await bcrypt.hash(password, 10);
		
		user.name = name;
		user.email = email || `phone_${validPhone.replace('+', '')}@temp.com`;
		user.password = hash;
		user.role = role === 'Partner' ? 'Partner' : 'user';
		user.isApproved = true;
		user.isPhoneVerified = true;
		user.isEmailVerified = !!email; // Only verified if email provided
		user.phoneOtpCode = undefined;
		user.phoneOtpExpiry = undefined;
		user.phoneOtpAttempts = 0;
		
		await user.save();
		
		res.json({ 
			success: true,
			message: 'Registration completed successfully! Phone verified.',
			userId: user._id 
		});
		
	} catch (error) {
		console.error('Verify Phone OTP error:', error);
		next(error);
	}
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res, next) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}
		
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			// Don't reveal if user exists for security
			return res.json({ 
				success: true, 
				message: 'If an account exists with this email, you will receive a password reset OTP.' 
			});
		}
		
		// Generate OTP
		const otpCode = EmailOTPService.generateOTP();
		const otpExpiry = EmailOTPService.generateOTPExpiry(10); // 10 minutes
		
		// Save OTP to user
		user.resetPasswordOtp = otpCode;
		user.resetPasswordOtpExpiry = otpExpiry;
		user.resetPasswordOtpAttempts = 0;
		await user.save();
		
		// Send OTP via email
		const otpResult = await EmailOTPService.sendEmailOTP(email, otpCode, 'Password Reset');
		
		if (otpResult.success) {
			const response = {
				success: true,
				message: 'OTP sent successfully to your email address',
				email: email,
				expiresIn: '10 minutes'
			};
			
			// Include OTP in development mode
			if (otpResult.developmentMode) {
				response.developmentOTP = otpResult.otp;
				response.developmentMessage = `Development Mode: Your OTP is ${otpResult.otp}`;
			}
			
			res.json(response);
		} else {
			res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP. Please try again.' 
			});
		}
		
	} catch (error) {
		console.error('Forgot password error:', error);
		next(error);
	}
});

// Verify OTP and Reset Password
router.post('/reset-password', async (req, res, next) => {
	try {
		const { email, otp, newPassword } = req.body;
		
		if (!email || !otp || !newPassword) {
			return res.status(400).json({ 
				message: 'Email, OTP, and new password are required' 
			});
		}
		
		// Validate password strength
		if (newPassword.length < 6) {
			return res.status(400).json({ 
				message: 'Password must be at least 6 characters long' 
			});
		}
		
		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ 
				message: 'Invalid email or OTP' 
			});
		}
		
		// Check if OTP exists
		if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
			return res.status(400).json({ 
				message: 'No password reset request found. Please request a new OTP.' 
			});
		}
		
		// Check if OTP expired
		if (EmailOTPService.isOTPExpired(user.resetPasswordOtpExpiry)) {
			return res.status(400).json({ 
				message: 'OTP has expired. Please request a new one.' 
			});
		}
		
		// Check OTP attempts
		if (user.resetPasswordOtpAttempts >= 5) {
			return res.status(400).json({ 
				message: 'Too many failed attempts. Please request a new OTP.' 
			});
		}
		
		// Verify OTP
		if (user.resetPasswordOtp !== otp) {
			user.resetPasswordOtpAttempts += 1;
			await user.save();
			
			return res.status(400).json({ 
				message: `Invalid OTP. ${5 - user.resetPasswordOtpAttempts} attempts remaining.` 
			});
		}
		
		// OTP verified! Reset password
		const hash = await bcrypt.hash(newPassword, 10);
		
		user.password = hash;
		user.resetPasswordOtp = undefined;
		user.resetPasswordOtpExpiry = undefined;
		user.resetPasswordOtpAttempts = 0;
		await user.save();
		
		res.json({ 
			success: true,
			message: 'Password reset successfully! You can now login with your new password.' 
		});
		
	} catch (error) {
		console.error('Reset password error:', error);
		next(error);
	}
});

router.get('/me', auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		res.json(user);
	} catch (e) { 
		next(e); 
	}
});
module.exports = router;
