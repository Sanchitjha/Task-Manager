const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    coinConversionRate: { type: Number, default: 1, min: 0.01 },
    coinPrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 }, // Keep for backward compatibility
    stock: { type: Number, default: 0 },
    images: [{ type: String }], // Stored as upload paths like /uploads/products/...
    partner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'general' },
    isPublished: { type: Boolean, default: true },
    sku: { type: String, default: null },
    weight: { type: String, default: null },
    dimensions: { type: String, default: null },
    tags: [{ type: String }],
    
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
  // Calculate final price after discount
  if (this.discountAmount > 0) {
    this.finalPrice = Math.max(0, this.originalPrice - this.discountAmount);
  } else if (this.discountPercentage > 0) {
    this.discountAmount = (this.originalPrice * this.discountPercentage) / 100;
    this.finalPrice = Math.max(0, this.originalPrice - this.discountAmount);
  } else {
    this.finalPrice = this.originalPrice;
    this.discountAmount = 0;
  }
  
  // Calculate coin price
  this.coinPrice = Math.ceil(this.finalPrice / this.coinConversionRate);
  
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
