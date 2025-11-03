const { Schema, model } = require('mongoose');

const videoSchema = new Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true },
		thumbnailUrl: { type: String },
		description: { type: String },
		duration: { type: Number, required: true }, // in seconds
		coinsReward: { type: Number, default: 10, required: true }, // Total coins for completing video (fixed mode)
		// New time-based coin calculation fields
		coinsPerInterval: { type: Number, default: 5 }, // Coins per time interval
		intervalDuration: { type: Number, default: 60 }, // Duration of each interval in seconds
		useTimeBased: { type: Boolean, default: false }, // Use time-based or fixed coins
		isActive: { type: Boolean, default: true }, // for admin to enable/disable videos
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Track who added the video
	},
	{ timestamps: true }
);

// Calculate total coins based on time intervals
videoSchema.virtual('totalCoins').get(function() {
	if (this.useTimeBased && this.duration > 0) {
		const intervals = Math.ceil(this.duration / this.intervalDuration);
		return intervals * this.coinsPerInterval;
	}
	return this.coinsReward;
});

// Include virtuals when converting to JSON
videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

const Video = model('Video', videoSchema);

module.exports = { Video };
