const express = require('express');
const { VendorProfile } = require('../schemas/VendorProfile');
const { Order } = require('../schemas/Order');
const { VendorReview } = require('../schemas/VendorReview');
const { Product } = require('../schemas/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ===== VENDOR PROFILE ROUTES =====

// Get or create vendor profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    let profile = await VendorProfile.findOne({ user: user._id }).populate('user', 'name email phone');
    
    if (!profile && user.role === 'vendor') {
      // Auto-create profile for new vendor
      profile = await VendorProfile.create({
        user: user._id,
        storeName: user.name + "'s Store",
        email: user.email,
        phone: user.phone
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
});

// Update vendor profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const { storeName, storeDescription, businessCategory, phone, email, address, shippingPolicy, returnPolicy, cancelPolicy } = req.body;

    let profile = await VendorProfile.findOne({ user: user._id });
    if (!profile) {
      // Create new profile if doesn't exist
      profile = new VendorProfile({ 
        user: user._id,
        storeName: storeName || (user.name + "'s Store"),
        email: email || user.email,
        phone: phone || user.phone
      });
    }

    // Update fields
    if (storeName !== undefined) profile.storeName = storeName;
    if (storeDescription !== undefined) profile.storeDescription = storeDescription;
    if (businessCategory !== undefined) profile.businessCategory = businessCategory;
    if (phone !== undefined) profile.phone = phone;
    if (email !== undefined) profile.email = email;
    if (address) {
      profile.address = { 
        street: address.street || profile.address?.street,
        city: address.city || profile.address?.city,
        state: address.state || profile.address?.state,
        zipCode: address.zipCode || profile.address?.zipCode,
        country: address.country || 'India'
      };
    }
    if (shippingPolicy !== undefined) profile.shippingPolicy = shippingPolicy;
    if (returnPolicy !== undefined) profile.returnPolicy = returnPolicy;
    if (cancelPolicy !== undefined) profile.cancelPolicy = cancelPolicy;

    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile update error:', error);
    next(error);
  }
});

// Get vendor dashboard stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const profile = await VendorProfile.findOne({ user: user._id });
    
    // Get orders for this vendor
    const orders = await Order.find({ vendor: user._id });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'completed' ? o.finalAmount : 0), 0);
    
    // Get products
    const products = await Product.find({ vendor: user._id });
    const totalProducts = products.length;
    
    // Get reviews
    const reviews = await VendorReview.find({ vendor: user._id });
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalReviews: reviews.length,
        averageRating: avgRating,
        walletBalance: profile?.walletBalance || 0,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== ORDER MANAGEMENT =====

// Get vendor's orders
router.get('/orders', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional filter

    const filter = { vendor: user._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('items.product', 'title price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Get single order
router.get('/orders/:id', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('vendor', 'name')
      .populate('items.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.vendor._id.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Update order status (vendor)
router.patch('/orders/:id/status', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// ===== REVIEWS =====

// Get vendor reviews
router.get('/reviews', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      VendorReview.find({ vendor: user._id })
        .populate('reviewer', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VendorReview.countDocuments({ vendor: user._id })
    ]);

    res.json({ success: true, reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
