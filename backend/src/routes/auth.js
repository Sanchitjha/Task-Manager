const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../schemas/User');

const router = express.Router();

router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already used' }); // Changed for debugging
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, password: hash, role: role || 'client' });
		res.json({ id: user._id });
	} catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev');
		res.json({ token });
	} catch (e) { next(e); }
});

module.exports = router;
