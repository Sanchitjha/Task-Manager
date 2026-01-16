const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String, required: true },
		profileImage: { type: String, default: null },
		
		// Partner-specific fields
		partnerAddress: {
			businessName: { type: String },
			street: { type: String },
			city: { type: String },
			state: { type: String },
			zipCode: { type: String },
			country: { type: String, default: 'India' },
			gstNumber: { type: String },
			contactNumber: { type: String }
		},
		
		role: { type: String, enum: ['admin', 'subadmin', 'user', 'partner'], default: 'user' },
		coinsBalance: { type: Number, default: 0 }, // Earned coins (not yet redeemed)
		walletBalance: { type: Number, default: 0 }, // Redeemed money
		
		// Sub-admin specific fields
		isApproved: { type: Boolean, default: true }, // false for sub-admins until approved
		approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin who approved
		approvedAt: { type: Date },
		
		// User relationship
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Sub-admin who added this user
		
		transferOverride: {
			sendBlocked: { type: Boolean, default: false },
			receiveBlocked: { type: Boolean, default: false }
		}
	},
	{ timestamps: true }
);

const User = model('User', userSchema);

module.exports = { User };
