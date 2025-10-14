const { Schema, model } = require('mongoose');

const videoSchema = new Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true },
		thumbnailUrl: { type: String },
		description: { type: String },
		duration: { type: Number, required: true }, // in seconds
		coinsReward: { type: Number, default: 10 }, // Deprecated - keeping for backward compatibility
		coinsPerMinute: { type: Number, default: 5, required: true }, // Coins earned per minute of video
		isActive: { type: Boolean, default: true }, // for admin to enable/disable videos
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Track who added the video
	},
	{ timestamps: true }
);

const Video = model('Video', videoSchema);

module.exports = { Video };
