const { Schema, model } = require('mongoose');

const inStorePurchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    
    // Purchase details
    productName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    coinsUsed: { type: Number, default: 0 },
    coinConversionRate: { type: Number, default: 1 },
    discountAmount: { type: Number, default: 0 }, // In rupees
    finalAmountPaid: { type: Number, required: true }, // Cash amount paid
    
    // Transaction details
    purchaseDate: { type: Date, default: Date.now },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Vendor
    confirmationMethod: {
      type: String,
      enum: ['manual_entry', 'qr_scan', 'user_id_scan'],
      default: 'manual_entry'
    },
    
    // Customer details at time of purchase
    customerDetails: {
      name: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    
    // Verification
    isVerified: { type: Boolean, default: true },
    verificationCode: { type: String }, // Optional 6-digit code for verification
    
    // Notes
    notes: { type: String },
    vendorNotes: { type: String },
    
    status: {
      type: String,
      enum: ['completed', 'disputed', 'cancelled'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

// Indexes for better performance
inStorePurchaseSchema.index({ user: 1, purchaseDate: -1 });
inStorePurchaseSchema.index({ vendor: 1, purchaseDate: -1 });
inStorePurchaseSchema.index({ product: 1, purchaseDate: -1 });

const InStorePurchase = model('InStorePurchase', inStorePurchaseSchema);

module.exports = { InStorePurchase };