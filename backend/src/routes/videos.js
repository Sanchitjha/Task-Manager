const express = require('express');
const { Video } = require('../schemas/Video');
const { VideoWatch } = require('../schemas/VideoWatch');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all active videos (for clients)
router.get('/', auth, async (req, res, next) => {
	try {
		const videos = await Video.find({ isActive: true })
			.select('-__v')
			.sort({ createdAt: -1 });
		
		// If user is a client, include watch progress
		if (req.user.role === 'client') {
			const videoIds = videos.map(v => v._id);
			const watchHistory = await VideoWatch.find({
				userId: req.user._id,
				videoId: { $in: videoIds }
			});
			
			const watchMap = {};
			watchHistory.forEach(w => {
				watchMap[w.videoId.toString()] = {
					watchTime: w.watchTime,
					coinsEarned: w.coinsEarned,
					completed: w.completed
				};
			});
			
			const videosWithProgress = videos.map(v => ({
				...v.toObject(),
				progress: watchMap[v._id.toString()] || { watchTime: 0, coinsEarned: 0, completed: false }
			}));
			
			return res.json(videosWithProgress);
		}
		
		res.json(videos);
	} catch (e) { next(e); }
});

// Get all videos for admin (including inactive)
router.get('/admin', auth, adminOnly, async (req, res, next) => {
	try {
		const videos = await Video.find()
			.populate('addedBy', 'name email')
			.select('-__v')
			.sort({ createdAt: -1 });
		res.json(videos);
	} catch (e) { next(e); }
});

// Add new video (admin/subadmin only)
router.post('/', auth, adminOnly, async (req, res, next) => {
	try {
		const { title, url, duration, coinsReward, description, thumbnailUrl } = req.body;
		
		if (!title || !url || !duration || !coinsReward) {
			return res.status(400).json({ message: 'Title, URL, duration, and coins reward are required' });
		}
		
		const video = await Video.create({ 
			title, 
			url, 
			duration, 
			coinsReward,
			description,
			thumbnailUrl,
			addedBy: req.user._id
		});
		
		res.status(201).json(video);
	} catch (e) { next(e); }
});

// Update video (admin/subadmin only)
router.patch('/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const { title, url, duration, coinsReward, description, thumbnailUrl, isActive } = req.body;
		
		const video = await Video.findByIdAndUpdate(
			req.params.id,
			{ title, url, duration, coinsReward, description, thumbnailUrl, isActive },
			{ new: true, runValidators: true }
		);
		
		if (!video) {
			return res.status(404).json({ message: 'Video not found' });
		}
		
		res.json(video);
	} catch (e) { next(e); }
});

// Delete video (admin/subadmin only)
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const video = await Video.findByIdAndDelete(req.params.id);
		
		if (!video) {
			return res.status(404).json({ message: 'Video not found' });
		}
		
		res.json({ message: 'Video deleted successfully' });
	} catch (e) { next(e); }
});

// Track video watch progress and award coins (clients only)
router.post('/:id/watch', auth, async (req, res, next) => {
	try {
		if (req.user.role !== 'client') {
			return res.status(403).json({ message: 'Only clients can earn coins from videos' });
		}
		
		const { watchTime } = req.body; // Watch time in seconds
		const video = await Video.findById(req.params.id);
		
		if (!video || !video.isActive) {
			return res.status(404).json({ message: 'Video not found or inactive' });
		}
		
		// Find or create watch record
		let watchRecord = await VideoWatch.findOne({
			userId: req.user._id,
			videoId: video._id
		});
		
		if (!watchRecord) {
			watchRecord = await VideoWatch.create({
				userId: req.user._id,
				videoId: video._id,
				watchTime: 0,
				coinsEarned: 0
			});
		}
		
		// If already completed, don't award more coins
		if (watchRecord.completed) {
			return res.json({
				message: 'Video already completed',
				watchRecord,
				coinsAwarded: 0
			});
		}
		
		// Update watch time
		watchRecord.watchTime = Math.min(watchTime, video.duration);
		watchRecord.lastWatchedAt = new Date();
		
		// Check if video is completed (watched at least 90% of duration)
		const completionThreshold = video.duration * 0.9;
		let coinsAwarded = 0;
		
		if (watchRecord.watchTime >= completionThreshold && !watchRecord.completed) {
			watchRecord.completed = true;
			coinsAwarded = video.coinsReward;
			watchRecord.coinsEarned = coinsAwarded;
			
			// Update user's coins balance
			await User.findByIdAndUpdate(
				req.user._id,
				{ $inc: { coinsBalance: coinsAwarded } }
			);
			
			// Create transaction record
			await Transaction.create({
				userId: req.user._id,
				type: 'earn',
				amount: coinsAwarded,
				description: `Earned ${coinsAwarded} coins by watching "${video.title}"`,
				metadata: {
					videoId: video._id,
					watchTime: watchRecord.watchTime
				}
			});
		}
		
		await watchRecord.save();
		
		// Get updated user data
		const updatedUser = await User.findById(req.user._id).select('coinsBalance');
		
		res.json({
			message: coinsAwarded > 0 ? 'Coins awarded!' : 'Watch progress updated',
			watchRecord,
			coinsAwarded,
			totalCoins: updatedUser.coinsBalance
		});
	} catch (e) { next(e); }
});

module.exports = router;
