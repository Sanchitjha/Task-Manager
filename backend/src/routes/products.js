const express = require('express');
const { Product } = require('../schemas/Product');
const { auth } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/uploadProduct');

const router = express.Router();

// Create product with images (partner or admin) - Combined endpoint
router.post('/create-with-images', auth, uploadProduct.array('images', 6), async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'Partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
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

// Create product (partner or admin)
router.post('/', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'Partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
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

// Get partner products with search and filters
router.get('/partner/my-products', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'Partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { page = 1, limit = 12, search, category, status, sortBy = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { vendor: user._id };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status) {
      filter.isPublished = status === 'active';
    }

    let sortQuery = {};
    switch (sortBy) {
      case 'name':
        sortQuery = { title: 1 };
        break;
      case 'price':
        sortQuery = { originalPrice: 1 };
        break;
      case 'stock':
        sortQuery = { stock: -1 };
        break;
      case 'createdAt':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(parseInt(skip)).limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    // Calculate stats
    const stats = {
      totalProducts: total,
      activeProducts: await Product.countDocuments({ vendor: user._id, isPublished: true }),
      outOfStock: await Product.countDocuments({ vendor: user._id, stock: 0 }),
      lowStock: await Product.countDocuments({ vendor: user._id, stock: { $lte: 5, $gt: 0 } })
    };

    res.json({
      success: true,
      products,
      stats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    next(error);
  }
});

// Search users (for partner purchase confirmation)
router.get('/partner/search-users', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { q } = req.query;
    if (!q) {
      return res.json({ users: [] });
    }

    const { User } = require('../schemas/User');
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email phone wallet.coins')
    .limit(10);

    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      coinsBalance: user.wallet?.coins || 0
    }));

    res.json({ users: formattedUsers });

  } catch (error) {
    next(error);
  }
});

// Search products (for partner purchase confirmation)
router.get('/partner/search-products', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { q } = req.query;
    if (!q) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      vendor: user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title sku originalPrice coinDiscount stock images')
    .limit(10);

    res.json({ products });

  } catch (error) {
    next(error);
  }
});

// Get products for a specific partner (public)
router.get('/partner/:partnerId/products', async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const { page = 1, limit = 12, search, category } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { 
      vendor: partnerId, 
      isPublished: true 
    };
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title description originalPrice coinDiscount images category stock')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
