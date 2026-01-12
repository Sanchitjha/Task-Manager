const { Schema, model } = require('mongoose');

const vendorProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    storeDescription: { type: String, default: '' },
    storeImage: { type: String, default: null }, // Logo/banner
    businessCategory: { type: String, default: 'general' },
    
    // Verification & Status
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    isSuspended: { type: Boolean, default: false },
    
    // Contact & Address
    phone: { type: String },
    email: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    
    // Banking & Wallet
    bankAccount: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String
    },
    walletBalance: { type: Number, default: 0 },
    
    // Statistics
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    
    // Policies
    shippingPolicy: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },
    cancelPolicy: { type: String, default: '' },
    
    // Metrics
    responseTime: { type: Number, default: 0 }, // Average response time in hours
    cancellationRate: { type: Number, default: 0 }, // Percentage
    returnRate: { type: Number, default: 0 }, // Percentage
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const VendorProfile = model('VendorProfile', vendorProfileSchema);
module.exports = { VendorProfile };
