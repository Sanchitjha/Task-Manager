const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

<<<<<<< HEAD
// Register new user (public - only for clients)
=======
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
>>>>>>> d309a46 (feat: Update registration terminology from 'client' and 'vendor' to 'user' and 'Partner' in auth routes)
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, phone, role } = req.body;
		
<<<<<<< HEAD
		// Validate required fields
		if (!name || !email || !password || !phone || !role) {
			return res.status(400).json({ message: 'Name, email, password, phone, and role are required' });
		}
		
		// Validate role
		if (!['client', 'vendor', 'subadmin'].includes(role)) {
			return res.status(400).json({ message: 'Invalid role. Must be client, vendor, or subadmin' });
=======
		// Only allow user registration through public route
		// Allow users and Partners to register publicly
		if (role && role !== 'user' && role !== 'Partner') {
			return res.status(403).json({ message: 'Only users or Partners can register publicly' });
>>>>>>> d309a46 (feat: Update registration terminology from 'client' and 'vendor' to 'user' and 'Partner' in auth routes)
		}
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
<<<<<<< HEAD
			password: hash,
			phone,
			role: role,
			isApproved: role === 'subadmin' ? false : true  // Sub-admins need approval
=======
			password: hash, 
			role: role === 'Partner' ? 'Partner' : 'user',
			isApproved: true 
>>>>>>> d309a46 (feat: Update registration terminology from 'client' and 'vendor' to 'user' and 'Partner' in auth routes)
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
module.exports = router;
