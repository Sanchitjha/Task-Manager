const jwt = require('jsonwebtoken');
const { User } = require('../schemas/User');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
		if (!token) return res.status(401).json({ message: 'No token provided' });
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev');
		const user = await User.findById(decoded.id).select('-password');
		if (!user) return res.status(401).json({ message: 'Invalid token' });
		
		req.user = user;
		req.userId = user._id;
		next();
	} catch (e) {
		res.status(401).json({ message: 'Invalid token' });
	}
};

const adminOnly = (req, res, next) => {
	if (req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Admin access required' });
	}
	next();
};

module.exports = { auth, adminOnly };
