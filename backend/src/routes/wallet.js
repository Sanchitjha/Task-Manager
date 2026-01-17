const express = require('express');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { WalletTransaction } = require('../schemas/WalletTransaction');
const { Product } = require('../schemas/Product');
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
	if (req.user.role !== 'user') {
		return res.status(403).json({ message: 'Only users can redeem coins' });
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

// ===== NEW WALLET SYSTEM =====

// Get wallet details (new system)
router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('wallet name email phone');

    res.json({
      success: true,
      wallet: {
        coins: user.wallet.coins || 0,
        totalEarned: user.wallet.totalEarned || 0,
        totalSpent: user.wallet.totalSpent || 0,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get wallet transactions (new system)
router.get('/transactions-history', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    
    // Type filter
    if (req.query.type && ['earned', 'spent'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    // Date filter
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .populate('vendor', 'name shopDetails.shopName')
        .populate('product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Check product coin discount
router.get('/check-discount/:productId', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    const product = await Product.findById(req.params.productId)
      .select('title originalPrice coinDiscount coinConversionRate vendor')
      .populate('vendor', 'name shopDetails.shopName shopDetails.address');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userCoins = user.wallet.coins || 0;
    const maxDiscountCoins = Math.min(userCoins, product.coinDiscount);
    const maxDiscountAmount = maxDiscountCoins * product.coinConversionRate;
    const finalPrice = Math.max(0, product.originalPrice - maxDiscountAmount);

    res.json({
      success: true,
      product: {
        title: product.title,
        originalPrice: product.originalPrice,
        coinDiscount: product.coinDiscount,
        coinConversionRate: product.coinConversionRate
      },
      user: {
        availableCoins: userCoins,
        maxUsableCoins: maxDiscountCoins,
        maxDiscountAmount,
        finalPrice
      },
      vendor: {
        name: product.vendor.name,
        shopName: product.vendor.shopDetails?.shopName,
        address: product.vendor.shopDetails?.address
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
