const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String, required: true },
		profileImage: { type: String, default: null },
		
		// Shop/Vendor Details for In-Store Model
		shopDetails: {
			shopName: { type: String },
			ownerName: { type: String },
			description: { type: String },
			category: { 
				type: String, 
				enum: ['grocery', 'fashion', 'electronics', 'pharmacy', 'restaurant', 'beauty', 'books', 'sports', 'toys', 'other'],
				default: 'other'
			},
			
			// Address Details (Mandatory for vendors)
			address: {
				street: { type: String },
				area: { type: String },
				city: { type: String },
				pincode: { type: String },
				state: { type: String },
				country: { type: String, default: 'India' }
			},
			
			// Location Details
			location: {
				latitude: { type: Number },
				longitude: { type: Number },
				mapUrl: { type: String }
			},
			
			// Contact & Timing
			contactNumber: { type: String },
			whatsappNumber: { type: String },
			timing: {
				openTime: { type: String },
				closeTime: { type: String },
				workingDays: [{ type: String }], // ['monday', 'tuesday', etc.]
				isOpen24x7: { type: Boolean, default: false }
			},
			
			// Verification & Status
			verification: {
				status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
				shopPhoto: { type: String },
				idProof: { type: String },
				verifiedAt: { type: Date },
				verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
				rejectionReason: { type: String }
			},
			
			// Shop Policies
			policies: {
				noDelivery: { type: Boolean, default: true },
				noReturns: { type: Boolean, default: true },
				noRefunds: { type: Boolean, default: true },
				cashOnlyPayment: { type: Boolean, default: true }
			},
			
			// Analytics
			analytics: {
				totalVisits: { type: Number, default: 0 },
				totalCoinsRedeemed: { type: Number, default: 0 },
				totalDiscountGiven: { type: Number, default: 0 }
			}
		},
		
		// Wallet for users
		wallet: {
			coins: { type: Number, default: 0 },
			totalEarned: { type: Number, default: 0 },
			totalSpent: { type: Number, default: 0 }
		},
		
		role: { type: String, enum: ['admin', 'subadmin', 'user', 'partner'], default: 'user' },
		
		// Email verification fields
		isEmailVerified: { type: Boolean, default: true },
		emailOtpCode: { type: String },
		emailOtpExpiry: { type: Date },
		emailOtpAttempts: { type: Number, default: 0 },
		
		// Sub-admin specific fields
		isApproved: { type: Boolean, default: true },
		approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		approvedAt: { type: Date },
		
		// User relationship
		addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		
		transferOverride: {
			sendBlocked: { type: Boolean, default: false },
			receiveBlocked: { type: Boolean, default: false }
		}
	},
	{ timestamps: true }
);

const User = model('User', userSchema);

module.exports = { User };
