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
    sku: { type: String, default: null }
  },
  { timestamps: true }
);

const Product = model('Product', productSchema);

module.exports = { Product };
