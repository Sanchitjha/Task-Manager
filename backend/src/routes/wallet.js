const express = require('express');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get wallet and coins balance
router.get('/balance', auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id).select('walletBalance coinsBalance');
		
		// Initialize coinsBalance if it doesn't exist (for existing users)
		if (user.coinsBalance === undefined) {
			user.coinsBalance = 0;
			await user.save();
		}
		
		res.json({ 
			walletBalance: user.walletBalance || 0,
			coinsBalance: user.coinsBalance || 0
		});
	} catch (e) { next(e); }
});

// Get transaction history
router.get('/transactions', auth, async (req, res, next) => {
	try {
		const transactions = await Transaction.find({ userId: req.user._id })
			.populate('metadata.videoId', 'title')
			.populate('metadata.senderId', 'name email')
			.populate('metadata.receiverId', 'name email')
			.sort('-createdAt')
			.limit(50);
		res.json(transactions);
	} catch (e) { next(e); }
});

// Redeem coins to wallet (convert coins to money)
router.post('/redeem', auth, async (req, res, next) => {
	try {
		if (req.user.role !== 'client') {
			return res.status(403).json({ message: 'Only clients can redeem coins' });
		}
		
		const { coinsAmount } = req.body;
		
		if (!coinsAmount || coinsAmount <= 0) {
			return res.status(400).json({ message: 'Invalid coins amount' });
		}
		
		const user = await User.findById(req.user._id);
		
		if (user.coinsBalance < coinsAmount) {
			return res.status(400).json({ message: 'Insufficient coins balance' });
		}
		
		// Conversion rate: 100 coins = 1 unit of currency
		const conversionRate = 100;
		const walletAmount = coinsAmount / conversionRate;
		
		// Update balances
		user.coinsBalance -= coinsAmount;
		user.walletBalance += walletAmount;
		await user.save();
		
		// Create transaction record
		await Transaction.create({
			userId: user._id,
			type: 'redeem',
			amount: walletAmount,
			description: `Redeemed ${coinsAmount} coins for ${walletAmount.toFixed(2)} currency`,
			metadata: {
				coinsRedeemed: coinsAmount
			}
		});
		
		res.json({
			message: 'Coins redeemed successfully',
			coinsRedeemed: coinsAmount,
			walletAmountAdded: walletAmount,
			newCoinsBalance: user.coinsBalance,
			newWalletBalance: user.walletBalance
		});
	} catch (e) { next(e); }
});

module.exports = router;
