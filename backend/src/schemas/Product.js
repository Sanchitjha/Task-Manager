const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ type: String }], // Stored as upload paths like /uploads/products/...
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'general' },
    isPublished: { type: Boolean, default: true },
    sku: { type: String, default: null },
    weight: { type: String, default: null },
    dimensions: { type: String, default: null },
    tags: [{ type: String }]
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
