const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' }
});

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true }, // UNIQUE order ID (e.g., ORD-2025-001234)
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    
    // Order details
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    
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
