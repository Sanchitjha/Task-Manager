const express = require('express');
const { User } = require('../schemas/User');

const router = express.Router();

router.get('/', async (_req, res, next) => {
	try {
		const users = await User.find().select('-password');
		res.json(users);
	} catch (e) { next(e); }
});

module.exports = router;
