const express = require('express');
const { Setting } = require('../schemas/Setting');

const router = express.Router();

router.get('/', async (_req, res, next) => {
	try {
		const settings = await Setting.find();
		const result = {};
		settings.forEach(s => result[s.key] = s.value);
		res.json(result);
	} catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
	try {
		const { key, value, description } = req.body;
		const setting = await Setting.findOneAndUpdate(
			{ key },
			{ key, value, description },
			{ upsert: true, new: true }
		);
		res.json(setting);
	} catch (e) { next(e); }
});

module.exports = router;
