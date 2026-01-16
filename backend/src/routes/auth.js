const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Register new user (public - only for clients)
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, phone, role } = req.body;
		
		// Validate required fields
		if (!name || !email || !password || !phone || !role) {
			return res.status(400).json({ message: 'Name, email, password, phone, and role are required' });
		}
		
		// Validate role
		if (!['client', 'vendor', 'subadmin'].includes(role)) {
			return res.status(400).json({ message: 'Invalid role. Must be client, vendor, or subadmin' });
		}
		
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ 
			name, 
			email, 
			password: hash,
			phone,
			role: role,
			isApproved: role === 'subadmin' ? false : true  // Sub-admins need approval
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
