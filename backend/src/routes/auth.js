const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth, adminOnly } = require('../middleware/auth'); 
const { OTPService } = require('../lib/otpService');

const router = express.Router();

// Send OTP for registration
router.post('/send-otp', async (req, res, next) => {
	try {
		const { phone } = req.body;
		
		if (!phone) {
			return res.status(400).json({ message: 'Phone number is required' });
		}
		
		// Validate phone format
		if (!OTPService.isValidPhoneFormat(phone)) {
			return res.status(400).json({ message: 'Invalid phone number format' });
		}
		
		const normalizedPhone = OTPService.normalizePhone(phone);
		
		// Check if phone number already exists and is verified
		const existingUser = await User.findOne({ phone: normalizedPhone, isPhoneVerified: true });
		if (existingUser) {
			return res.status(400).json({ message: 'Phone number already registered and verified' });
		}
		
		// Generate OTP
		const otpCode = OTPService.generateOTP();
		const otpExpiry = OTPService.generateOTPExpiry();
		
		// Find or create temporary user record for OTP
		let tempUser = await User.findOne({ phone: normalizedPhone, isPhoneVerified: false });
		
		if (tempUser) {
			// Update existing temp record
			tempUser.otpCode = otpCode;
			tempUser.otpExpiry = otpExpiry;
			tempUser.otpAttempts = 0;
			await tempUser.save();
		} else {
			// Create new temp record (will be completed after OTP verification)
			tempUser = await User.create({
				name: 'Temp User', // Will be updated during registration
				email: `temp_${Date.now()}@temp.com`, // Temporary email
				password: 'temp', // Temporary password
				phone: normalizedPhone,
				isPhoneVerified: false,
				otpCode,
				otpExpiry,
				otpAttempts: 0
			});
		}
		
		// Send OTP
		const otpResult = await OTPService.sendOTP(normalizedPhone, otpCode);
		
		if (otpResult.success) {
			res.json({
				success: true,
				message: 'OTP sent successfully to your phone number',
				phoneNumber: normalizedPhone,
				expiresIn: '5 minutes'
			});
		} else {
			res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP. Please try again.' 
			});
		}
		
	} catch (error) {
		console.error('Send OTP error:', error);
		next(error);
	}
});

// Verify OTP and complete registration
router.post('/verify-otp-register', async (req, res, next) => {
	try {
		const { phone, otp, name, email, password, role } = req.body;
		
		// Validate required fields
		if (!phone || !otp || !name || !email || !password) {
			return res.status(400).json({ 
				message: 'Phone, OTP, name, email, and password are required' 
			});
		}
		
		// Only allow client registration through public route
		if (role && role !== 'client') {
			return res.status(403).json({ message: 'Only clients can register publicly' });
		}
		
		const normalizedPhone = OTPService.normalizePhone(phone);
		
		// Find user with this phone number
		const user = await User.findOne({ phone: normalizedPhone, isPhoneVerified: false });
		
		if (!user) {
			return res.status(400).json({ 
				message: 'No OTP request found for this phone number. Please request a new OTP.' 
			});
		}
		
		// Check if OTP expired
		if (OTPService.isOTPExpired(user.otpExpiry)) {
			return res.status(400).json({ 
				message: 'OTP has expired. Please request a new OTP.' 
			});
		}
		
		// Check OTP attempts
		if (user.otpAttempts >= 5) {
			return res.status(400).json({ 
				message: 'Too many failed attempts. Please request a new OTP.' 
			});
		}
		
		// Verify OTP
		if (user.otpCode !== otp) {
			user.otpAttempts += 1;
			await user.save();
			
			return res.status(400).json({ 
				message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` 
			});
		}
		
		// Check if email already exists (separate from temp record)
		const existingEmailUser = await User.findOne({ 
			email, 
			isPhoneVerified: true 
		});
		if (existingEmailUser) {
			return res.status(400).json({ message: 'Email already registered' });
		}
		
		// OTP verified! Complete the registration
		const hash = await bcrypt.hash(password, 10);
		
		user.name = name;
		user.email = email;
		user.password = hash;
		user.role = 'client';
		user.isApproved = true;
		user.isPhoneVerified = true;
		user.otpCode = undefined;
		user.otpExpiry = undefined;
		user.otpAttempts = 0;
		
		await user.save();
		
		res.json({ 
			success: true,
			message: 'Registration completed successfully! Phone number verified.',
			userId: user._id 
		});
		
	} catch (error) {
		console.error('Verify OTP error:', error);
		next(error);
	}
});

// Register new user (public - only for clients)
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		
		// Only allow client registration through public route
		if (role && role !== 'client') {
			return res.status(403).json({ message: 'Only clients can register publicly' });
		}
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash, 
			role: 'client',
			isApproved: true 
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
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		
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
			isPhoneVerified: user.isPhoneVerified || false,
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