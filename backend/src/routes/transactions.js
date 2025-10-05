const express = require('express');
const { Transaction } = require('../schemas/Transaction');

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const { userId, type } = req.query;
		const filter = {};
		if (userId) filter.userId = userId;
		if (type) filter.type = type;
		const transactions = await Transaction.find(filter).populate('userId', 'name email').sort('-createdAt');
		res.json(transactions);
	} catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
	try {
		const { userId, type, amount, description, metadata } = req.body;
		const transaction = await Transaction.create({ userId, type, amount, description, metadata });
		res.json(transaction);
	} catch (e) { next(e); }
});

module.exports = router;
