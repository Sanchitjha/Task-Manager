const express = require('express');
const { Video } = require('../schemas/Video');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res, next) => {
	try {
		const videos = await Video.find({ isActive: true }).select('-__v');
		res.json(videos);
	} catch (e) { next(e); }
});

router.post('/', auth, adminOnly, async (req, res, next) => {
	try {
		const { title, url, duration, coinsPerMinute, maxCoins } = req.body;
		const video = await Video.create({ title, url, duration, coinsPerMinute, maxCoins });
		res.json(video);
	} catch (e) { next(e); }
});

module.exports = router;
