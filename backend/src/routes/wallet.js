const express = require('express');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/balance', auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).select('walletBalance');
		res.json({ balance: user.walletBalance });
	} catch (e) { next(e); }
});

router.get('/transactions', auth, async (req, res, next) => {
	try {
		const transactions = await Transaction.find({ userId: req.userId }).sort('-createdAt');
		res.json(transactions);
	} catch (e) { next(e); }
});

module.exports = router;
