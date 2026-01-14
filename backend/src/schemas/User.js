const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String }, // Optional phone number (no verification required)
		isEmailVerified: { type: Boolean, default: false }, // Email verification status
		profileImage: { type: String, default: null },
		
		// OTP fields for email verification
		otpCode: { type: String },
		otpExpiry: { type: Date },
		isTemporary: { type: Boolean, default: false }, // For temporary user records during OTP verification
		isVerified: { type: Boolean, default: false },
		
		// Vendor-specific fields
		vendorAddress: {
			businessName: { type: String },
			street: { type: String },
			city: { type: String },
			state: { type: String },
			zipCode: { type: String },
			country: { type: String, default: 'India' },
			gstNumber: { type: String },
			contactNumber: { type: String }
		},
		
		role: { type: String, enum: ['admin', 'subadmin', 'client', 'vendor'], default: 'client' },
		coinsBalance: { type: Number, default: 0 }, // Earned coins (not yet redeemed)
		walletBalance: { type: Number, default: 0 }, // Redeemed money
		
		// Sub-admin specific fields
		isApproved: { type: Boolean, default: true }, // false for sub-admins until approved
		approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin who approved
		approvedAt: { type: Date },
		
		// Client relationship
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Sub-admin who added this client
		
		transferOverride: {
			sendBlocked: { type: Boolean, default: false },
			receiveBlocked: { type: Boolean, default: false }
		}
	},
	{ timestamps: true }
);

const User = model('User', userSchema);

module.exports = { User };
