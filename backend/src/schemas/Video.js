const { Schema, model } = require('mongoose');

const videoSchema = new Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true },
		thumbnailUrl: { type: String },
		description: { type: String },
		duration: { type: Number, required: true }, // in seconds
		coinsReward: { type: Number, default: 10, required: true }, // Total coins for completing video
		isActive: { type: Boolean, default: true }, // for admin to enable/disable videos
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Track who added the video
	},
	{ timestamps: true }
);

const Video = model('Video', videoSchema);

module.exports = { Video };
