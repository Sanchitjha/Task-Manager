const { Schema, model } = require('mongoose');

const partnerReviewSchema = new Schema(
  {
    partner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' }, // Optional - link to order
    
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, default: '' },
    
    // Review categories
    productQuality: { type: Number, min: 1, max: 5 },
    shippingSpeed: { type: Number, min: 1, max: 5 },
    customerService: { type: Number, min: 1, max: 5 },
    packaging: { type: Number, min: 1, max: 5 },
    
    images: [{ type: String }], // Review images
    
    helpful: { type: Number, default: 0 }, // Count of helpful marks
    verified: { type: Boolean, default: true }, // Verified purchase
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const PartnerReview = model('PartnerReview', partnerReviewSchema);
module.exports = { PartnerReview };
