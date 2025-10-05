const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['admin', 'subadmin', 'client', 'vendor'], default: 'client' },
		walletBalance: { type: Number, default: 0 },
		transferOverride: {
			sendBlocked: { type: Boolean, default: false },
			receiveBlocked: { type: Boolean, default: false }
		}
	},
	{ timestamps: true }
);

const User = model('User', userSchema);

module.exports = { User };
