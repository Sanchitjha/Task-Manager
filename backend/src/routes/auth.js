const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth, adminOnly } = require('../middleware/auth'); 
const { EmailOTPService } = require('../lib/emailOtpService');

const router = express.Router();

// Register new user (public - only for clients)
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		
		// Only allow client registration through public route
		// Allow clients and vendors to register publicly
		if (role && role !== 'client' && role !== 'vendor') {
			return res.status(403).json({ message: 'Only clients or vendors can register publicly' });
		}
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash, 
			role: role === 'vendor' ? 'vendor' : 'client',
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

router.get('/me', auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		res.json(user);
	} catch (e) { 
		next(e); 
	}
});

// Send Email OTP (for registration verification)
router.post('/send-email-otp', async (req, res, next) => {
	try {
		const { email } = req.body;
		console.log('🔐 Received OTP request for email:', email);
		console.log('Request headers:', req.headers);
		console.log('Request origin:', req.get('origin'));
		
		if (!email) {
			console.log('❌ No email provided');
			return res.status(400).json({ message: 'Email is required' });
		}
		
		// Validate email format
		if (!EmailOTPService.isValidEmailFormat(email)) {
			console.log('❌ Invalid email format:', email);
			return res.status(400).json({ message: 'Invalid email format' });
		}
		
		// Check if email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser && !existingUser.isTemporary) {
			console.log('❌ Email already registered:', email);
			return res.status(400).json({ message: 'Email is already registered' });
		}
		
		// Delete any existing temporary users for this email
		await User.deleteMany({ email: email, isTemporary: true });
		
		// Generate OTP
		const otpCode = EmailOTPService.generateOTP();
		const otpExpiry = EmailOTPService.generateOTPExpiry();
		
		console.log(`📧 Generated OTP for ${email}: ${otpCode}`);
		
		// Send OTP email
		const emailResult = await EmailOTPService.sendEmailOTP(email, otpCode);
		
		if (emailResult.success) {
			// Store OTP in temporary user document
			const tempUser = await User.create({
				name: 'temp_user_' + Date.now(),
				email: email,
				password: 'temp_password_' + Date.now(),
				role: 'client',
				isApproved: false,
				isVerified: false,
				otpCode: otpCode,
				otpExpiry: otpExpiry,
				isTemporary: true
			});
			
			console.log('✅ OTP stored for user:', email);
			
			res.json({
				success: true,
				message: emailResult.message,
				tempUserId: tempUser._id,
				developmentOTP: process.env.NODE_ENV !== 'production' ? otpCode : undefined
			});
		} else {
			console.error('❌ Failed to send OTP email');
			res.status(500).json({ 
				message: emailResult.message 
			});
		}
	} catch (error) {
		console.error('❌ Error in send-email-otp:', error);
		res.status(500).json({ 
			message: 'Internal server error', 
			error: error.message 
		});
	}
});

// Verify Email OTP and complete registration
router.post('/verify-email-otp', async (req, res, next) => {
	try {
		const { email, otpCode, name, password } = req.body;
		console.log('🔍 Verifying OTP for email:', email, 'Code:', otpCode);
		
		if (!email || !otpCode || !name || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}
		
		// Find temporary user with OTP
		const tempUser = await User.findOne({ 
			email: email, 
			isTemporary: true 
		});
		
		if (!tempUser) {
			console.log('❌ No temporary user found for:', email);
			return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
		}
		
		// Check OTP expiry
		if (new Date() > tempUser.otpExpiry) {
			console.log('❌ OTP expired for:', email);
			await User.deleteOne({ _id: tempUser._id });
			return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
		}
		
		// Verify OTP
		if (tempUser.otpCode !== otpCode) {
			console.log('❌ Invalid OTP for:', email, 'Expected:', tempUser.otpCode, 'Got:', otpCode);
			return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
		}
		
		console.log('✅ OTP verified for:', email);
		
		// Hash password and create real user
		const hashedPassword = await bcrypt.hash(password, 10);
		
		const newUser = await User.create({
			name: name,
			email: email,
			password: hashedPassword,
			role: 'client',
			isApproved: true,
			isVerified: true,
			isTemporary: false
		});
		
		// Delete temporary user
		await User.deleteOne({ _id: tempUser._id });
		
		console.log('✅ User registered successfully:', email);
		
		// Generate JWT token for immediate login
		const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'secret');
		
		res.json({
			success: true,
			message: 'Registration successful!',
			token: token,
			user: {
				id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role
			}
		});
		
	} catch (error) {
		console.error('❌ Error in verify-email-otp:', error);
		next(error);
	}
});

module.exports = router;