const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');
const { auth } = require('../middleware/auth'); 

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' });
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, password: hash, role: role || 'client' });
		
		res.json({ id: user._id });
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
		
		const token = jwt.sign(
			{ id: user._id, role: user.role, email: user.email }, 
			process.env.JWT_SECRET || 'dev',
			{ expiresIn: '24h' }
		);
		
		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000 // 24 hours
		});
		
		// Send response with token and user data
		res.json({ 
			token, 
			user: { 
				id: user._id, 
				name: user.name, 
				email: user.email, 
				role: user.role 
			} 
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