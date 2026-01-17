const express = require('express');
const { Product } = require('../schemas/Product');
const { auth } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/uploadProduct');

const router = express.Router();

// Create product with images (vendor or admin) - Combined endpoint
router.post('/create-with-images', auth, uploadProduct.array('images', 6), async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const { 
      title, description, originalPrice, discountPercentage, coinDiscount, coinConversionRate, 
      stock, category, isPublished, sku, weight, dimensions, tags 
    } = req.body;
    
    if (!title || typeof originalPrice === 'undefined') {
      return res.status(400).json({ message: 'Title and original price required' });
    }

    // Parse arrays if they come as strings from FormData
    const parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const parsedDimensions = typeof dimensions === 'string' && dimensions ? dimensions : null;

    // Create product with image paths
    const images = req.files ? req.files.map(f => `/uploads/products/${f.filename}`) : [];

    const product = await Product.create({
      title,
      description,
      originalPrice: Number(originalPrice),
      discountPercentage: Number(discountPercentage) || 0,
      coinDiscount: Number(coinDiscount) || 0,
      coinConversionRate: Number(coinConversionRate) || 1,
      stock: Number(stock) || 0,
      category: category || 'general',
      isPublished: typeof isPublished !== 'undefined' ? !!isPublished : true,
      sku: sku || null,
      weight: weight || null,
      dimensions: parsedDimensions,
      tags: parsedTags,
      images: images,
      vendor: user._id
    });

    res.json({ success: true, product, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
});

// Create product (vendor or admin)
router.post('/', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const { 
      title, description, originalPrice, discountPercentage, coinDiscount, coinConversionRate, 
      stock, category, isPublished, sku, weight, dimensions, tags 
    } = req.body;
    
    if (!title || typeof originalPrice === 'undefined') {
      return res.status(400).json({ message: 'Title and original price required' });
    }

    const product = await Product.create({
      title,
      description,
      originalPrice: Number(originalPrice),
      discountPercentage: Number(discountPercentage) || 0,
      coinDiscount: Number(coinDiscount) || 0,
      coinConversionRate: Number(coinConversionRate) || 1,
      stock: Number(stock) || 0,
      category: category || 'general',
      isPublished: typeof isPublished !== 'undefined' ? !!isPublished : true,
      sku: sku || null,
      weight: weight || null,
      dimensions: dimensions || null,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      vendor: user._id
    });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// Upload images for a product (vendor must own product or admin)
router.post('/:id/images', auth, uploadProduct.array('images', 6), async (req, res, next) => {
  try {
    const user = req.user;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (user.role !== 'admin' && product.vendor.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to modify images for this product' });
    }

    const added = [];
    if (req.files && req.files.length) {
      req.files.forEach((f) => {
        const path = `/uploads/products/${f.filename}`;
        product.images.push(path);
        added.push(path);
      });
      await product.save();
    }

    res.json({ success: true, added, product });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (user.role !== 'admin' && product.vendor.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to update this product' });
    }

    const fields = [
      'title', 'description', 'originalPrice', 'discountPercentage', 'coinConversionRate',
      'stock', 'category', 'isPublished', 'sku', 'weight', 'dimensions', 'tags'
    ];
    
    fields.forEach((f) => {
      if (typeof req.body[f] !== 'undefined') {
        if (f === 'tags') {
          product.tags = Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
        } else if (['originalPrice', 'discountPercentage', 'coinConversionRate'].includes(f)) {
          product[f] = Number(req.body[f]);
        } else {
          product[f] = req.body[f];
        }
      }
    });

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// Delete product
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (user.role !== 'admin' && product.vendor.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// Public listing with pagination and filters
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.vendor) filter.vendor = req.query.vendor;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) filter.title = { $regex: req.query.q, $options: 'i' };

    const [items, total] = await Promise.all([
      Product.find(filter).populate('vendor', 'name profileImage').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Get product by id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name profileImage');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
