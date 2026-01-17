const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    originalPrice: { type: Number, required: true },
    
    // Coin-based Discount System for In-Store Model
    coinDiscount: { type: Number, default: 0, min: 0 }, // Coins user can redeem
    coinConversionRate: { type: Number, default: 1, min: 0.01 }, // 1 coin = ₹1 by default
    finalPriceAfterCoins: { type: Number, default: 0 }, // Price after max coin discount
    
    // Traditional discount (kept for compatibility)
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    
    price: { type: Number, default: 0 }, // Keep for backward compatibility
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'general' },
    isPublished: { type: Boolean, default: true },
    sku: { type: String, default: null },
    weight: { type: String, default: null },
    dimensions: { type: String, default: null },
    tags: [{ type: String }],
    
    // In-Store Specific
    inStoreOnly: { type: Boolean, default: true },
    allowOnlineOrder: { type: Boolean, default: false },
    
    // Analytics
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalCoinsUsed: { type: Number, default: 0 },
      totalInStorePurchases: { type: Number, default: 0 }
    },
    
    // Discount Management
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
    isDiscountActive: { type: Boolean, default: false },
    
    // Subscription Management
    requiresSubscription: { type: Boolean, default: false },
    currentSubscription: { type: Schema.Types.ObjectId, ref: 'ProductSubscription' },
    subscriptionExpiry: { type: Date },
    subscriptionHistory: [{ type: Schema.Types.ObjectId, ref: 'ProductSubscription' }]
  },
  { timestamps: true }
);

// Pre-save middleware to calculate prices
productSchema.pre('save', function(next) {
  // Calculate traditional final price after discount
  if (this.discountAmount > 0) {
    this.finalPrice = Math.max(0, this.originalPrice - this.discountAmount);
  } else if (this.discountPercentage > 0) {
    this.discountAmount = (this.originalPrice * this.discountPercentage) / 100;
    this.finalPrice = Math.max(0, this.originalPrice - this.discountAmount);
  } else {
    this.finalPrice = this.originalPrice;
    this.discountAmount = 0;
  }
  
  // Calculate final price after coin discount
  if (this.coinDiscount > 0) {
    const maxCoinDiscount = this.coinDiscount * this.coinConversionRate;
    this.finalPriceAfterCoins = Math.max(0, this.originalPrice - maxCoinDiscount);
  } else {
    this.finalPriceAfterCoins = this.originalPrice;
  }
  
  // Set price for backward compatibility
  this.price = this.finalPrice;
  
  // Check if discount is active based on dates
  const now = new Date();
  if (this.discountStartDate && this.discountEndDate) {
    this.isDiscountActive = now >= this.discountStartDate && now <= this.discountEndDate;
  }
  
  this.updatedAt = new Date();
  next();
});

const Product = model('Product', productSchema);

module.exports = { Product };
