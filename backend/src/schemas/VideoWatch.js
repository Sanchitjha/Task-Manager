const { Schema, model } = require('mongoose');

const videoWatchSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
		watchTime: { type: Number, default: 0 }, // Total watch time in seconds
		coinsEarned: { type: Number, default: 0 },
		completed: { type: Boolean, default: false },
		lastWatchedAt: { type: Date, default: Date.now }
	},
	{ timestamps: true }
);

// Create compound index to ensure one watch record per user per video
videoWatchSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const VideoWatch = model('VideoWatch', videoWatchSchema);

module.exports = { VideoWatch };
