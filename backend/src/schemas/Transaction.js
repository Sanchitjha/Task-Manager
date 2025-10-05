const { Schema, model } = require('mongoose');

const transactionSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: { type: String, enum: ['earn', 'redeem', 'transfer_send', 'transfer_receive'], required: true },
		amount: { type: Number, required: true },
		description: { type: String },
		metadata: {
			videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
			watchTime: { type: Number }, // in seconds
			senderId: { type: Schema.Types.ObjectId, ref: 'User' },
			receiverId: { type: Schema.Types.ObjectId, ref: 'User' }
		}
	},
	{ timestamps: true }
);

const Transaction = model('Transaction', transactionSchema);

module.exports = { Transaction };
