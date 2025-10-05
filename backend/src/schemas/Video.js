const { Schema, model } = require('mongoose');

const videoSchema = new Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true },
		duration: { type: Number, required: true }, // in seconds
		coinsPerMinute: { type: Number, default: 10 }, // coins earned per minute of watch time
		maxCoins: { type: Number, default: 50 }, // maximum coins earnable per video
		isActive: { type: Boolean, default: true } // for admin to enable/disable videos
	},
	{ timestamps: true }
);

const Video = model('Video', videoSchema);

module.exports = { Video };
