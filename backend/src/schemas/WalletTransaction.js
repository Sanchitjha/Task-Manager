const { Schema, model } = require('mongoose');

const walletTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User' }, // For purchases
    product: { type: Schema.Types.ObjectId, ref: 'Product' }, // For purchases
    
    type: { 
      type: String, 
      enum: ['earned', 'spent', 'refund', 'bonus', 'referral', 'discount_used'],
      required: true 
    },
    
    amount: { type: Number, required: true }, // Coin amount
    
    // Transaction details
    description: { type: String, required: true },
    source: { 
      type: String, 
      enum: ['app_usage', 'referral', 'bonus', 'in_store_purchase', 'admin_adjustment'],
      required: true 
    },
    
    // For in-store purchases
    inStorePurchase: {
      productName: { type: String },
      originalPrice: { type: Number },
      coinsUsed: { type: Number },
      discountAmount: { type: Number }, // Rupee equivalent
      finalAmountPaid: { type: Number }, // Cash paid
      purchaseDate: { type: Date },
      confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Vendor who confirmed
    },
    
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },
    
    // Balance tracking
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true }
  },
  { timestamps: true }
);

// Index for faster queries
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ vendor: 1, createdAt: -1 });

const WalletTransaction = model('WalletTransaction', walletTransactionSchema);

module.exports = { WalletTransaction };