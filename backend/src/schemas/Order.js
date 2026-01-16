const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  
  // Pricing details for receipt
  originalPrice: { type: Number, required: true }, // Original price per unit in ₹
  discountAmount: { type: Number, default: 0 }, // Discount per unit in ₹
  finalPricePerUnit: { type: Number, required: true }, // Final price per unit in ₹
  coinsPaidPerUnit: { type: Number, required: true }, // Coins paid per unit
  
  totalOriginalPrice: { type: Number, required: true }, // quantity * originalPrice
  totalDiscountAmount: { type: Number, default: 0 }, // quantity * discountAmount
  totalFinalPrice: { type: Number, required: true }, // quantity * finalPricePerUnit
  totalCoinsPaid: { type: Number, required: true }, // quantity * coinsPaidPerUnit
  
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' }
});

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true }, // UNIQUE order ID (e.g., ORD-2025-001234)
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    
    // Order details with pricing breakdown
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    
    // Pricing breakdown for receipt
    totalOriginalAmount: { type: Number, required: true }, // Sum of all original prices
    totalDiscountAmount: { type: Number, default: 0 }, // Sum of all discounts
    totalFinalAmount: { type: Number, required: true }, // Final amount after discounts
    totalCoinsUsed: { type: Number, required: true }, // Total coins deducted
    coinConversionRate: { type: Number, default: 1 }, // Rate used for conversion
    
    // Receipt information
    receiptGenerated: { type: Boolean, default: false },
    receiptUrl: { type: String }, // PDF receipt URL
    receiptNumber: { type: String, unique: true }, // Unique receipt number
    
    // Shipping
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    
    // Tracking
    trackingNumber: { type: String, default: null },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    
    // Payment
    paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'bank_transfer'], default: 'card' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    
    // Vendor settlement
    vendorPayout: { type: Number, default: 0 },
    payoutStatus: { type: String, enum: ['pending', 'processed', 'cancelled'], default: 'pending' },
    
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-generate orderId before save
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  const count = await this.constructor.countDocuments();
  this.orderId = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  next();
});

const Order = model('Order', orderSchema);
module.exports = { Order };
