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

// Get all sub-admins with their client count (Admin only)
router.get('/subadmins', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmins = await User.find({ role: 'subadmin' })
			.select('-password')
			.populate('approvedBy', 'name email')
			.sort({ createdAt: -1 });
		
		// Get client count for each sub-admin
		const subadminsWithStats = await Promise.all(
			subadmins.map(async (subadmin) => {
				const clientCount = await User.countDocuments({ 
					role: 'client', 
					addedBy: subadmin._id 
				});
				
				return {
					...subadmin.toObject(),
					clientCount
				};
			})
		);
		
		res.json(subadminsWithStats);
	} catch (e) { next(e); }
});

// Get specific sub-admin details with their clients (Admin only)
router.get('/subadmins/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const subadmin = await User.findOne({ 
			_id: req.params.id, 
			role: 'subadmin' 
		}).select('-password').populate('approvedBy', 'name email');
		
		if (!subadmin) {
			return res.status(404).json({ message: 'Sub-admin not found' });
		}
		
		// Get all clients added by this sub-admin
		const clients = await User.find({ 
			role: 'client', 
			addedBy: subadmin._id 
		}).select('-password').sort({ createdAt: -1 });
		
		// Get statistics for each client
		const clientsWithStats = await Promise.all(
			clients.map(async (client) => {
				const [videosWatched, totalCoinsEarned, totalRedeemed] = await Promise.all([
					VideoWatch.countDocuments({ userId: client._id, completed: true }),
					Transaction.aggregate([
						{ $match: { userId: client._id, type: 'earn' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					]),
					Transaction.aggregate([
						{ $match: { userId: client._id, type: 'redeem' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					])
				]);
				
				return {
					...client.toObject(),
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
			clients: clientsWithStats,
			totalClients: clientsWithStats.length
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

// ===== CLIENT MANAGEMENT ROUTES =====

// Add client (Sub-admin or Admin)
router.post('/clients', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		
		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(400).json({ message: 'Email already used' });
		}
		
		const hash = await bcrypt.hash(password, 10);
		const client = await User.create({
			name,
			email,
			password: hash,
			role: 'client',
			addedBy: req.user._id, // Track who added this client
			isApproved: true
		});
		
		res.status(201).json({
			message: 'Client added successfully',
			client: {
				_id: client._id,
				name: client.name,
				email: client.email,
				role: client.role
			}
		});
	} catch (e) { next(e); }
});

// Get clients (Admin sees all, Sub-admin sees only their clients)
router.get('/clients', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const query = { role: 'client' };
		
		// Sub-admins can only see their own clients
		if (req.user.role === 'subadmin') {
			query.addedBy = req.user._id;
		}
		
		const clients = await User.find(query)
			.select('-password')
			.populate('addedBy', 'name email role')
			.sort({ createdAt: -1 });
		
		// Get statistics for each client
		const clientsWithStats = await Promise.all(
			clients.map(async (client) => {
				const [videosWatched, totalEarnings] = await Promise.all([
					VideoWatch.countDocuments({ userId: client._id, completed: true }),
					Transaction.aggregate([
						{ $match: { userId: client._id, type: 'earn' } },
						{ $group: { _id: null, total: { $sum: '$amount' } } }
					])
				]);
				
				return {
					...client.toObject(),
					stats: {
						videosWatched,
						totalEarnings: totalEarnings[0]?.total || 0
					}
				};
			})
		);
		
		res.json(clientsWithStats);
	} catch (e) { next(e); }
});

// Get specific client details
router.get('/clients/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const client = await User.findOne({ 
			_id: req.params.id, 
			role: 'client' 
		}).select('-password').populate('addedBy', 'name email role');
		
		if (!client) {
			return res.status(404).json({ message: 'Client not found' });
		}
		
		// Sub-admins can only view their own clients
		if (req.user.role === 'subadmin' && client.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		// Get detailed statistics
		const [videosWatched, transactions, watchHistory] = await Promise.all([
			VideoWatch.countDocuments({ userId: client._id, completed: true }),
			Transaction.find({ userId: client._id })
				.populate('metadata.videoId', 'title')
				.sort({ createdAt: -1 })
				.limit(20),
			VideoWatch.find({ userId: client._id })
				.populate('videoId', 'title coinsReward')
				.sort({ lastWatchedAt: -1 })
				.limit(10)
		]);
		
		res.json({
			client: client.toObject(),
			stats: {
				videosWatched,
				coinsBalance: client.coinsBalance,
				walletBalance: client.walletBalance
			},
			recentTransactions: transactions,
			recentVideos: watchHistory
		});
	} catch (e) { next(e); }
});

// Update client (Can only update own clients)
router.patch('/clients/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const { name, email } = req.body;
		
		const client = await User.findOne({ 
			_id: req.params.id, 
			role: 'client' 
		});
		
		if (!client) {
			return res.status(404).json({ message: 'Client not found' });
		}
		
		// Sub-admins can only update their own clients
		if (req.user.role === 'subadmin' && client.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		client.name = name || client.name;
		client.email = email || client.email;
		await client.save();
		
		res.json({
			message: 'Client updated successfully',
			client: {
				_id: client._id,
				name: client.name,
				email: client.email
			}
		});
	} catch (e) { next(e); }
});

// Delete client (Can only delete own clients)
router.delete('/clients/:id', auth, adminOrSubadmin, async (req, res, next) => {
	try {
		const client = await User.findOne({ 
			_id: req.params.id, 
			role: 'client' 
		});
		
		if (!client) {
			return res.status(404).json({ message: 'Client not found' });
		}
		
		// Sub-admins can only delete their own clients
		if (req.user.role === 'subadmin' && client.addedBy?.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		await User.findByIdAndDelete(req.params.id);
		
		res.json({ message: 'Client deleted successfully' });
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
			totalClients,
			totalCoinsEarned,
			totalRedeemed
		] = await Promise.all([
			User.countDocuments({ role: 'subadmin' }),
			User.countDocuments({ role: 'subadmin', isApproved: true }),
			User.countDocuments({ role: 'subadmin', isApproved: false }),
			User.countDocuments({ role: 'client' }),
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
			clients: {
				total: totalClients
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
		
		const [totalClients, activeClients] = await Promise.all([
			User.countDocuments({ role: 'client', addedBy: userId }),
			User.countDocuments({ 
				role: 'client', 
				addedBy: userId,
				coinsBalance: { $gt: 0 }
			})
		]);
		
		res.json({
			clients: {
				total: totalClients,
				active: activeClients
			}
		});
	} catch (e) { next(e); }
});

module.exports = router;
