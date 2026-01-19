const express = require('express');
const { PartnerProfile } = require('../schemas/VendorProfile');
const { Order } = require('../schemas/Order');
const { PartnerReview } = require('../schemas/VendorReview');
const { Product } = require('../schemas/Product');
const { Transaction } = require('../schemas/Transaction');
const { User } = require('../schemas/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ===== PARTNER PROFILE ROUTES =====

// Get or create Partner profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    let profile = await PartnerProfile.findOne({ user: user._id }).populate('user', 'name email phone');
    
    if (!profile && user.role === 'vendor' || user.role === 'partner') {
      // Auto-create profile for new Partner
      profile = await PartnerProfile.create({
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

// Update Partner profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { storeName, storeDescription, businessCategory, phone, email, address, shippingPolicy, returnPolicy, cancelPolicy } = req.body;

    let profile = await PartnerProfile.findOne({ user: user._id });
    if (!profile) {
      // Create new profile if doesn't exist
      profile = new PartnerProfile({ 
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

// Get Partner dashboard stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const profile = await PartnerProfile.findOne({ user: user._id });
    
    // Get orders for this Partner
    const orders = await Order.find({ vendor: user._id });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'completed' ? o.finalAmount : 0), 0);
    
    // Get products
    const products = await Product.find({ vendor: user._id });
    const totalProducts = products.length;
    
    // Get reviews
    const reviews = await PartnerReview.find({ vendor: user._id });
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

// Get Partner's orders
router.get('/orders', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
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

// Update order status (Partner)
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

// ===== WALLET ROUTES =====

// Get Partner wallet data (for tracking sales only)
router.get('/wallet', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    // Get current balance from user (coins earned from sales)
    const partner = await User.findById(user._id);
    const balance = partner.coinsBalance || 0;

    // Get pending earnings (orders that are confirmed but not yet delivered)
    const pendingOrders = await Order.find({
      vendor: user._id,
      orderStatus: { $in: ['confirmed', 'processing', 'shipped'] },
      paymentStatus: 'paid'
    });
    const pendingEarnings = pendingOrders.reduce((sum, order) => sum + (order.totalCoinsUsed || 0), 0);

    // Get total earnings (all completed transactions)
    const saleTransactions = await Transaction.find({
      userId: user._id,
      type: 'sale',
      status: 'completed'
    });
    const totalEarnings = saleTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Get recent transactions
    const transactions = await Transaction.find({
      userId: user._id,
      type: { $in: ['sale', 'refund'] }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      balance,
      pendingEarnings,
      totalEarnings,
      transactions
    });
  } catch (error) {
    next(error);
  }
});

// ===== ANALYTICS ROUTES =====

// Get Partner analytics
router.get('/analytics', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const range = req.query.range || 'week'; // week, month, year
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get orders in range
    const orders = await Order.find({
      vendor: user._id,
      createdAt: { $gte: startDate },
      paymentStatus: 'paid'
    }).populate('items.product', 'title');

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCoinsUsed || 0), 0);
    const totalOrders = orders.length;

    // Get products
    const products = await Product.find({ vendor: user._id });
    const totalProducts = products.length;

    // Get reviews
    const reviews = await VendorReview.find({ vendor: user._id });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Calculate top products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString() || item.product?.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            _id: productId,
            name: item.productSnapshot?.title || 'Unknown',
            salesCount: 0,
            revenue: 0
          };
        }
        productSales[productId].salesCount += item.quantity;
        productSales[productId].revenue += item.totalCoinsPaid || 0;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(order => ({
        _id: order._id,
        customerName: order.shippingAddress?.fullName || 'Unknown',
        itemCount: order.items.length,
        total: order.totalCoinsUsed,
        status: order.orderStatus,
        createdAt: order.createdAt
      }));

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalProducts,
      averageRating,
      topProducts,
      recentOrders,
      salesTrend: [] // Could be implemented for chart data
    });
  } catch (error) {
    next(error);
  }
});

// ===== REVIEWS =====

// Get Partner reviews
router.get('/reviews', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
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
