const express = require('express');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { VideoWatch } = require('../schemas/VideoWatch');
const bcrypt = require('bcryptjs');
const { auth, adminOnly, adminOrSubadmin } = require('../middleware/auth');

const router = express.Router();

// ===== ADMIN MANAGEMENT ROUTES =====

// Get all pending sub-admin approvals (Admin only)
router.get('/subadmins/pending', auth, adminOnly, async (req, res, next) => {
	try {
		const pendingSubadmins = await User.find({ 
			role: 'subadmin', 
			isApproved: false 
		}).select('-password').sort({ createdAt: -1 });
		
		res.json(pendingSubadmins);
	} catch (e) { next(e); }
});

// Get all sub-admins with their user count (Admin only)
router.get('/subadmins', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmins = await User.find({ role: 'subadmin' })
			.select('-password')
			.populate('approvedBy', 'name email')
			.sort({ createdAt: -1 });
		
		// Get user count for each sub-admin
		const subadminsWithStats = await Promise.all(
			subadmins.map(async (subadmin) => {
				const userCount = await User.countDocuments({ 
					role: 'user', 
					addedBy: subadmin._id 
				});
				
				return {
					...subadmin.toObject(),
					userCount
				};
			})
		);
		
		res.json(subadminsWithStats);
	} catch (e) { next(e); }
});

// Get specific sub-admin details with their users (Admin only)
router.get('/subadmins/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmin = await User.findOne({ 
			_id: req.params.id, 
			role: 'subadmin' 
		}).select('-password').populate('approvedBy', 'name email');
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		// Get all users added by this sub-admin
		const users = await User.find({ 
			role: 'user', 
			addedBy: subadmin._id 
		}).select('-password').sort({ createdAt: -1 });
		
		// Get statistics for each user
		const usersWithStats = await Promise.all(
			users.map(async (user) => {
				const [videosWatched, totalCoinsEarned, totalRedeemed] = await Promise.all([
					VideoWatch.countDocuments({ userId: user._id, completed: true }),
					Transaction.aggregate([
						{ $match: { userId: user._id, type: 'earn' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					]),
					Transaction.aggregate([
						{ $match: { userId: user._id, type: 'redeem' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					])
				]);
				
				return {
					...user.toObject(),
					stats: {
						videosWatched,
						totalCoinsEarned: totalCoinsEarned[0]?.total || 0,
						totalRedeemed: totalRedeemed[0]?.total || 0
					}
				};
			})
		);
		
		res.json({
			subadmin: subadmin.toObject(),
			users: usersWithStats,
			totalUsers: usersWithStats.length
		});
	} catch (e) { next(e); }
});

// Approve sub-admin (Admin only)
router.post('/subadmins/:id/approve', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmin = await User.findOne({ 
			_id: req.params.id, 
			role: 'subadmin' 
		});
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		if (subadmin.isApproved) {
			return res.status(400).json({ message: 'Sub-admin already approved' });
		}
		
		subadmin.isApproved = true;
		subadmin.approvedBy = req.user._id;
		subadmin.approvedAt = new Date();
		await subadmin.save();
		
		res.json({ 
			message: 'Sub-admin approved successfully',
			subadmin: {
				_id: subadmin._id,
				name: subadmin.name,
				email: subadmin.email,
				isApproved: subadmin.isApproved
			}
		});
	} catch (e) { next(e); }
});

// Reject/Revoke sub-admin approval (Admin only)
router.post('/subadmins/:id/revoke', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmin = await User.findOne({ 
			_id: req.params.id, 
			role: 'subadmin' 
		});
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		subadmin.isApproved = false;
		subadmin.approvedBy = null;
		subadmin.approvedAt = null;
		await subadmin.save();
		
		res.json({ message: 'Sub-admin approval revoked successfully' });
	} catch (e) { next(e); }
});

// Delete sub-admin (Admin only)
router.delete('/subadmins/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmin = await User.findOneAndDelete({ 
			_id: req.params.id, 
			role: 'subadmin' 
		});
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		res.json({ message: 'Sub-admin deleted successfully' });
	} catch (e) { next(e); }
});

// Update sub-admin (Admin only)
router.patch('/subadmins/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const { name, email } = req.body;
		
		const subadmin = await User.findOneAndUpdate(
			{ _id: req.params.id, role: 'subadmin' },
			{ name, email },
			{ new: true, runValidators: true }
		).select('-password');
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		res.json(subadmin);
	} catch (e) { next(e); }
});

// ===== USER MANAGEMENT ROUTES =====

// Add user (Sub-admin or Admin)
router.post('/users', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		
		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(400).json({ message: 'Email already used' });
		}
		
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({
			name,
			email,
			password: hash,
			role: 'user',
			addedBy: req.user._id, // Track who added this user
			isApproved: true
		});
		
		res.status(201).json({
			message: 'User added successfully',
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (e) { next(e); }
});

// Get users (Admin sees all, Sub-admin sees only their users)
router.get('/users', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const query = { role: 'user' };
		
		// Sub-admins can only see their own users
		if (req.user.role === 'subadmin') {
			query.addedBy = req.user._id;
		}
		
		const users = await User.find(query)
			.select('-password')
			.populate('addedBy', 'name email role')
			.sort({ createdAt: -1 });
		
		// Get statistics for each user
		const usersWithStats = await Promise.all(
			users.map(async (user) => {
				const [videosWatched, totalEarnings] = await Promise.all([
					VideoWatch.countDocuments({ userId: user._id, completed: true }),
					Transaction.aggregate([
						{ $match: { userId: user._id, type: 'earn' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					])
				]);
				
				return {
					...user.toObject(),
					stats: {
						videosWatched,
						totalEarnings: totalEarnings[0]?.total || 0
					}
				};
			})
		);
		
		res.json(usersWithStats);
	} catch (e) { next(e); }
});

// Get specific user details
router.get('/users/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const user = await User.findOne({ 
			_id: req.params.id, 
			role: 'user' 
		}).select('-password').populate('addedBy', 'name email role');
		
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		
		// Sub-admins can only view their own users
		if (req.user.role === 'subadmin' && user.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		// Get detailed statistics
		const [videosWatched, transactions, watchHistory] = await Promise.all([
			VideoWatch.countDocuments({ userId: user._id, completed: true }),
			Transaction.find({ userId: user._id })
				.populate('metadata.videoId', 'title')
				.sort({ createdAt: -1 })
				.limit(20),
			VideoWatch.find({ userId: user._id })
				.populate('videoId', 'title coinsReward')
				.sort({ lastWatchedAt: -1 })
				.limit(10)
		]);
		
		res.json({
			user: user.toObject(),
			stats: {
				videosWatched,
				coinsBalance: user.coinsBalance,
				walletBalance: user.walletBalance
			},
			recentTransactions: transactions,
			recentVideos: watchHistory
		});
	} catch (e) { next(e); }
});

// Update user (Can only update own users)
router.patch('/users/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const { name, email } = req.body;
		
		const user = await User.findOne({ 
			_id: req.params.id, 
			role: 'user' 
		});
		
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		
		// Sub-admins can only update their own users
		if (req.user.role === 'subadmin' && user.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		user.name = name || user.name;
		user.email = email || user.email;
		await user.save();
		
		res.json({
			message: 'User updated successfully',
			user: {
				_id: user._id,
				name: user.name,
				email: user.email
			}
		});
	} catch (e) { next(e); }
});

// Delete user (Can only delete own users)
router.delete('/users/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const user = await User.findOne({ 
			_id: req.params.id, 
			role: 'user' 
		});
		
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		
		// Sub-admins can only delete their own users
		if (req.user.role === 'subadmin' && user.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		await User.findByIdAndDelete(req.params.id);
		
		res.json({ message: 'User deleted successfully' });
	} catch (e) { next(e); }
});

// ===== DASHBOARD STATISTICS =====

// Get admin dashboard statistics
router.get('/dashboard/stats', auth, adminOnly, async (req, res, next) => {
	try {
		const [
			totalSubadmins,
			approvedSubadmins,
			pendingSubadmins,
			totalUsers,
			totalCoinsEarned,
			totalRedeemed
		] = await Promise.all([
			User.countDocuments({ role: 'subadmin' }),
			User.countDocuments({ role: 'subadmin', isApproved: true }),
			User.countDocuments({ role: 'subadmin', isApproved: false }),
			User.countDocuments({ role: 'user' }),
			Transaction.aggregate([
				{ $match: { type: 'earn' } },
				{ $group: { _id: null, total: { $sum: '$amount' } } }
			]),
			Transaction.aggregate([
				{ $match: { type: 'redeem' } },
				{ $group: { _id: null, total: { $sum: '$amount' } } }
			])
		]);
		
		res.json({
			subadmins: {
				total: totalSubadmins,
				approved: approvedSubadmins,
				pending: pendingSubadmins
			},
			users: {
				total: totalUsers
			},
			earnings: {
				totalCoinsEarned: totalCoinsEarned[0]?.total || 0,
				totalRedeemed: totalRedeemed[0]?.total || 0
			}
		});
	} catch (e) { next(e); }
});

// Get sub-admin dashboard statistics
router.get('/dashboard/subadmin-stats', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const userId = req.user.role === 'subadmin' ? req.user._id : null;
		
		if (!userId) {
			return res.status(403).json({ message: 'Sub-admin access required' });
		}
		
		const [totalUsers, activeUsers] = await Promise.all([
			User.countDocuments({ role: 'user', addedBy: userId }),
			User.countDocuments({ 
				role: 'user', 
				addedBy: userId,
				coinsBalance: { $gt: 0 }
			})
		]);
		
		res.json({
			users: {
				total: totalUsers,
				active: activeUsers
			}
		});
	} catch (e) { next(e); }
});

// ===== PARTNER MANAGEMENT ROUTES =====

// Get all Partners (admin only)
router.get('/partners', auth, adminOnly, async (req, res, next) => {
	try {
		const partners = await User.find({ role: { $in: ['partner', 'partner'] } })
			.select('-password')
			.sort({ createdAt: -1 });
		
		res.json({ success: true, partners });
	} catch (e) { next(e); }
});

// Update partner status (admin only)
router.patch('/partners/:partnerId', auth, adminOnly, async (req, res, next) => {
	try {
		const { isActive } = req.body;
		
		const partner = await User.findById(req.params.partnerId);
		if (!partner || (partner.role !== 'partner' && partner.role !== 'partner')) {
			return res.status(404).json({ error: 'Partner not found' });
		}
		
		partner.isActive = isActive;
		await partner.save();
		
		// If deactivating partner, unpublish their products
		if (!isActive) {
			const { Product } = require('../schemas/Product');
			await Product.updateMany(
				{ partner: partner._id },
				{ isPublished: false }
			);
		}
		
		res.json({ success: true, partner });
	} catch (e) { next(e); }
});

// Get all products (admin only)
router.get('/products', auth, adminOnly, async (req, res, next) => {
	try {
		const { Product } = require('../schemas/Product');
		const products = await Product.find()
			.populate('partner', 'name email')
			.sort({ createdAt: -1 });
		
		res.json({ success: true, products });
	} catch (e) { next(e); }
});

// Delete product (admin only)
router.delete('/products/:productId', auth, adminOnly, async (req, res, next) => {
	try {
		const { Product } = require('../schemas/Product');
		const product = await Product.findById(req.params.productId);
		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}
		
		await Product.findByIdAndDelete(req.params.productId);
		
		res.json({ success: true, message: 'Product deleted successfully' });
	} catch (e) { next(e); }
});

// Get all orders (admin only)
router.get('/orders', auth, adminOnly, async (req, res, next) => {
	try {
		const { Order } = require('../schemas/Order');
		const orders = await Order.find()
			.populate('customer.user', 'name email phone')
			.populate('items.product', 'title price category')
			.populate('items.partner', 'name email')
			.sort({ createdAt: -1 });
		
		res.json({ success: true, orders });
	} catch (e) { next(e); }
});

// Update order status (admin only)
router.patch('/orders/:orderId', auth, adminOnly, async (req, res, next) => {
	try {
		const { Order } = require('../schemas/Order');
		const { status } = req.body;
		
		const order = await Order.findById(req.params.orderId);
		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}
		
		order.status = status;
		if (status === 'delivered') {
			order.deliveredAt = new Date();
		}
		
		await order.save();
		
		res.json({ success: true, order });
	} catch (e) { next(e); }
});

// Get partner management stats (admin only)
router.get('/partner-stats', auth, adminOnly, async (req, res, next) => {
	try {
		const totalPartners = await User.countDocuments({ role: { $in: ['partner', 'partner'] } });
		const activePartners = await User.countDocuments({ role: { $in: ['partner', 'partner'] }, isActive: true });
		
		const { Product } = require('../schemas/Product');
		const totalProducts = await Product.countDocuments();
		const publishedProducts = await Product.countDocuments({ isPublished: true });
		
		const { Order } = require('../schemas/Order');
		const totalOrders = await Order.countDocuments();
		const pendingOrders = await Order.countDocuments({ status: 'pending' });
		const completedOrders = await Order.countDocuments({ status: 'delivered' });
		
		// Calculate total revenue
		const completedOrdersData = await Order.find({ status: 'delivered' });
		const totalRevenue = completedOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);
		
		const stats = {
			partners: {
				total: totalPartners,
				active: activePartners,
				inactive: totalPartners - activePartners
			},
			products: {
				total: totalProducts,
				published: publishedProducts,
				draft: totalProducts - publishedProducts
			},
			orders: {
				total: totalOrders,
				pending: pendingOrders,
				completed: completedOrders
			},
			revenue: {
				total: totalRevenue
			}
		};
		
		res.json({ success: true, stats });
	} catch (e) { next(e); }
});

// ===== COIN DISTRIBUTION ROUTES =====

// Distribute coins to users (Admin only)
router.post('/distribute-coins', auth, adminOnly, async (req, res, next) => {
	try {
		const { userEmail, amount, description } = req.body;
		
		if (!userEmail || !amount || amount <= 0) {
			return res.status(400).json({ error: 'User email and valid amount are required' });
		}
		
		// Find the target user
		const targetUser = await User.findOne({ email: userEmail });
		if (!targetUser) {
			return res.status(404).json({ error: 'User not found' });
		}
		
		// Add coins to user's balance
		targetUser.coinBalance = (targetUser.coinBalance || 0) + parseInt(amount);
		await targetUser.save();
		
		// Create transaction record
		const transaction = new Transaction({
			user: targetUser._id,
			type: 'admin_distribution',
			amount: parseInt(amount),
			description: description || `Admin distribution: ${amount} coins`,
			status: 'completed',
			performedBy: req.user._id
		});
		
		await transaction.save();
		
		res.json({ 
			success: true, 
			message: `Successfully distributed ${amount} coins to ${targetUser.name}`,
			newBalance: targetUser.coinBalance 
		});
		
	} catch (e) { next(e); }
});

// Get all users for coin distribution dropdown (Admin only)
router.get('/all-users', auth, adminOnly, async (req, res, next) => {
	try {
		const users = await User.find({ 
			role: { $in: ['user', 'subadmin'] },
			isApproved: true 
		}).select('name email role coinBalance').sort({ name: 1 });
		
		res.json(users);
	} catch (e) { next(e); }
});

// Sub-admin coin distribution to users
router.post('/subadmin/distribute-coins', auth, async (req, res, next) => {
	try {
		if (req.user.role !== 'subadmin') {
			return res.status(403).json({ error: 'Only sub-admins can use this endpoint' });
		}

		const { userEmail, amount, description } = req.body;
		
		if (!userEmail || !amount || amount <= 0) {
			return res.status(400).json({ error: 'User email and valid amount are required' });
		}

		// Check if sub-admin has enough coins
		const subadmin = await User.findById(req.user._id);
		if (!subadmin || (subadmin.coinBalance || 0) < parseInt(amount)) {
			return res.status(400).json({ error: 'Insufficient coin balance' });
		}

		// Find the target user and verify it's managed by this sub-admin
		const targetUser = await User.findOne({ 
			email: userEmail, 
			role: 'user',
			addedBy: req.user._id 
		});
		
		if (!targetUser) {
			return res.status(404).json({ error: 'User not found or not managed by you' });
		}

		// Transfer coins
		subadmin.coinBalance = (subadmin.coinBalance || 0) - parseInt(amount);
		targetUser.coinBalance = (targetUser.coinBalance || 0) + parseInt(amount);
		
		await subadmin.save();
		await targetUser.save();

		// Create transaction records
		const subadminTransaction = new Transaction({
			user: subadmin._id,
			type: 'subadmin_distribution_out',
			amount: -parseInt(amount),
			description: description || `Distributed ${amount} coins to ${targetUser.name}`,
			status: 'completed',
			relatedUser: targetUser._id
		});

		const userTransaction = new Transaction({
			user: targetUser._id,
			type: 'subadmin_distribution_in',
			amount: parseInt(amount),
			description: description || `Received ${amount} coins from sub-admin`,
			status: 'completed',
			performedBy: subadmin._id
		});

		await subadminTransaction.save();
		await userTransaction.save();

		res.json({ 
			success: true, 
			message: `Successfully distributed ${amount} coins to ${targetUser.name}`,
			newBalance: subadmin.coinBalance 
		});

	} catch (e) { next(e); }
});

module.exports = router;
