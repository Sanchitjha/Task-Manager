const express = require('express');
const { Video } = require('../schemas/Video');
const { VideoWatch } = require('../schemas/VideoWatch');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to fetch video duration from YouTube (using oEmbed API - no API key needed)
const getYouTubeVideoDuration = async (videoUrl) => {
	try {
		const videoId = getYouTubeVideoId(videoUrl);
		if (!videoId) {
			throw new Error('Invalid YouTube URL');
		}

		// Use YouTube oEmbed API to get basic video info
		const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
		const response = await fetch(oEmbedUrl);
		
		if (!response.ok) {
			throw new Error('Video not found or private');
		}

		const data = await response.json();
		
		// For duration, we'll use a different approach since oEmbed doesn't provide duration
		// We'll extract it from the video page HTML (basic scraping)
		const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
		const pageResponse = await fetch(videoPageUrl);
		const html = await pageResponse.text();
		
		// Look for duration in the page HTML
		const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
		const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
		
		return {
			title: data.title,
			duration: duration,
			thumbnailUrl: data.thumbnail_url,
			videoId: videoId
		};
	} catch (error) {
		console.error('Error fetching YouTube video info:', error);
		// Return null if we can't fetch the info - admin will need to enter manually
		return null;
	}
};

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

// Auto-detect video information from YouTube URL (for preview)
router.post('/detect', auth, adminOnly, async (req, res, next) => {
	try {
		const { url, coinsPerMinute } = req.body;
		
		if (!url) {
			return res.status(400).json({ message: 'YouTube URL is required' });
		}

		const coinsPerMin = coinsPerMinute || 5;
		const videoInfo = await getYouTubeVideoDuration(url);
		
		if (!videoInfo || !videoInfo.duration) {
			return res.status(400).json({ 
				message: 'Could not detect video information. Please check the URL or use manual entry.' 
			});
		}

		const totalMinutes = Math.ceil(videoInfo.duration / 60);
		const totalCoins = totalMinutes * coinsPerMin;

		res.json({
			detected: true,
			title: videoInfo.title,
			duration: videoInfo.duration,
			durationFormatted: `${Math.floor(videoInfo.duration/60)}:${(videoInfo.duration%60).toString().padStart(2,'0')}`,
			thumbnailUrl: videoInfo.thumbnailUrl,
			totalMinutes,
			coinsPerMinute: coinsPerMin,
			totalCoins,
			preview: `This ${Math.floor(videoInfo.duration/60)}:${(videoInfo.duration%60).toString().padStart(2,'0')} video will give ${totalCoins} coins (${totalMinutes} minutes × ${coinsPerMin} coins per minute)`
		});
	} catch (e) { 
		console.error('Error detecting video:', e);
		res.status(500).json({ message: 'Failed to detect video information' });
	}
});

// Add new video (admin/subadmin only)
router.post('/', auth, adminOnly, async (req, res, next) => {
	try {
		const { 
			title, 
			url, 
			description, 
			coinsPerMinute, // Changed to coins per minute for easier admin understanding
			manualDuration // Optional: if admin wants to override auto-detected duration
		} = req.body;
		
		if (!title || !url) {
			return res.status(400).json({ message: 'Title and YouTube URL are required' });
		}

		// Set default coins per minute if not provided
		const coinsPerMin = coinsPerMinute || 5;

		let videoInfo;
		let finalDuration;
		let finalTitle = title;
		let thumbnailUrl = '';

		// Try to automatically fetch video information
		if (manualDuration) {
			// Admin provided manual duration
			finalDuration = parseInt(manualDuration);
		} else {
			// Try to auto-fetch video duration
			videoInfo = await getYouTubeVideoDuration(url);
			if (videoInfo && videoInfo.duration > 0) {
				finalDuration = videoInfo.duration;
				thumbnailUrl = videoInfo.thumbnailUrl || '';
				// Use YouTube title if admin didn't provide a custom one
				if (!title.trim()) {
					finalTitle = videoInfo.title;
				}
			} else {
				return res.status(400).json({ 
					message: 'Could not automatically detect video duration. Please provide manual duration in seconds.' 
				});
			}
		}

		if (!finalDuration || finalDuration <= 0) {
			return res.status(400).json({ message: 'Invalid video duration' });
		}

		// Calculate total coins based on minutes
		const totalMinutes = Math.ceil(finalDuration / 60); // Round up to next minute
		const totalCoins = totalMinutes * coinsPerMin;

		const video = await Video.create({ 
			title: finalTitle, 
			url, 
			duration: finalDuration,
			description: description || '',
			thumbnailUrl,
			// Always use time-based calculation with minute intervals
			useTimeBased: true,
			coinsPerInterval: coinsPerMin,
			intervalDuration: 60, // Always 1 minute intervals
			coinsReward: totalCoins, // Store calculated total for backward compatibility
			addedBy: req.user._id
		});
		
		res.status(201).json({
			...video.toObject(),
			autoDetected: !!videoInfo,
			calculatedCoins: totalCoins,
			totalMinutes: totalMinutes,
			message: `Video added successfully! Duration: ${Math.floor(finalDuration/60)}:${(finalDuration%60).toString().padStart(2,'0')} | Total coins: ${totalCoins} (${totalMinutes} minutes × ${coinsPerMin} coins)`
		});
	} catch (e) { 
		console.error('Error adding video:', e);
		next(e); 
	}
});

// Update video (admin/subadmin only)
router.patch('/:id', auth, adminOnly, async (req, res, next) => {
	try {
		const { 
			title, 
			url, 
			duration, 
			coinsReward, 
			description, 
			thumbnailUrl, 
			isActive,
			useTimeBased,
			coinsPerInterval,
			intervalDuration
		} = req.body;
		
		const updateData = {};
		if (title !== undefined) updateData.title = title;
		if (url !== undefined) updateData.url = url;
		if (duration !== undefined) updateData.duration = duration;
		if (coinsReward !== undefined) updateData.coinsReward = coinsReward;
		if (description !== undefined) updateData.description = description;
		if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
		if (isActive !== undefined) updateData.isActive = isActive;
		if (useTimeBased !== undefined) updateData.useTimeBased = useTimeBased;
		if (coinsPerInterval !== undefined) updateData.coinsPerInterval = coinsPerInterval;
		if (intervalDuration !== undefined) updateData.intervalDuration = intervalDuration;
		
		const video = await Video.findByIdAndUpdate(
			req.params.id,
			updateData,
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

// Track video watch progress and award coins (all authenticated users)
router.post('/:id/watch', auth, async (req, res, next) => {
	try {
		// Allow all authenticated users to watch videos and earn coins
		// (admins can test their own videos, clients earn normally)
		
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
		
		// Check if video is completed (watched 100% of duration)
		// Using 99% to account for slight timing variations
		const completionThreshold = video.duration * 0.99;
		let coinsAwarded = 0;
		
		if (watchRecord.watchTime >= completionThreshold && !watchRecord.completed) {
			watchRecord.completed = true;
			
			// Calculate coins based on minute-based system
			// Always use time-based calculation: minutes × coins per minute
			const totalMinutes = Math.ceil(video.duration / 60);
			coinsAwarded = totalMinutes * (video.coinsPerInterval || 5);
			
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
					watchTime: watchRecord.watchTime,
					coinCalculation: `${totalMinutes} minutes × ${video.coinsPerInterval || 5} coins per minute`
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
