const { Schema, model } = require('mongoose');

const transactionSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: { 
			type: String, 
			enum: ['earn', 'redeem', 'transfer_send', 'transfer_receive', 'purchase', 'sale', 'refund', 'withdrawal'], 
			required: true 
		},
		amount: { type: Number, required: true },
		description: { type: String },
		status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
		metadata: {
			videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
			watchTime: { type: Number }, // in seconds
			senderId: { type: Schema.Types.ObjectId, ref: 'User' },
			receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
			orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
			vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
			customerId: { type: Schema.Types.ObjectId, ref: 'User' },
			itemCount: { type: Number },
			bankDetails: { type: Object }
		}
	},
	{ timestamps: true }
);

const Transaction = model('Transaction', transactionSchema);

module.exports = { Transaction };
