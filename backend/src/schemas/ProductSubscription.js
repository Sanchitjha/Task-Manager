const { Schema, model } = require('mongoose');

const productSubscriptionSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Subscription Details
    numberOfDays: { type: Number, required: true, min: 1 },
    numberOfImages: { type: Number, required: true, min: 1 },
    pricePerImagePerDay: { type: Number, default: 1 }, // ₹1 per image per day
    totalAmount: { type: Number, required: true }, // numberOfImages × numberOfDays × pricePerImagePerDay
    
    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Payment Status
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paymentMethod: { type: String, default: 'online' },
    paymentDate: { type: Date },
    transactionId: { type: String },
    
    // Subscription Status
    status: { 
      type: String, 
      enum: ['active', 'expired', 'cancelled', 'pending'], 
      default: 'pending' 
    },
    
    // Notifications
    expiryNotificationSent: { type: Boolean, default: false },
    expiryNotificationSentAt: { type: Date },
    
    // Admin Actions
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    
    // Renewal
    renewalCount: { type: Number, default: 0 },
    previousSubscription: { type: Schema.Types.ObjectId, ref: 'ProductSubscription' },
    
    notes: { type: String }
  },
  { timestamps: true }
);

// Index for efficient queries
productSubscriptionSchema.index({ vendor: 1, status: 1 });
productSubscriptionSchema.index({ endDate: 1, status: 1 });
productSubscriptionSchema.index({ product: 1 });

// Method to check if subscription is expired
productSubscriptionSchema.methods.isExpired = function() {
  return new Date() > this.endDate && this.status === 'active';
};

// Method to calculate days remaining
productSubscriptionSchema.methods.daysRemaining = function() {
  const now = new Date();
  const diff = this.endDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Static method to calculate total amount
productSubscriptionSchema.statics.calculateAmount = function(numberOfImages, numberOfDays, pricePerImagePerDay = 1) {
  return numberOfImages * numberOfDays * pricePerImagePerDay;
};

const ProductSubscription = model('ProductSubscription', productSubscriptionSchema);

module.exports = { ProductSubscription };
