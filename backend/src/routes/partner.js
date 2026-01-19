const express = require('express');
const { PartnerProfile } = require('../schemas/VendorProfile');
const { Order } = require('../schemas/Order');
const { PartnerReview } = require('../schemas/VendorReview');
const { Product } = require('../schemas/Product');
const { Transaction } = require('../schemas/Transaction');
const { User } = require('../schemas/User');
const { WalletTransaction } = require('../schemas/WalletTransaction');
const { InStorePurchase } = require('../schemas/InStorePurchase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ===== PARTNER PROFILE ROUTES =====

// Get or create Partner profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    let profile = await PartnerProfile.findOne({ user: user._id }).populate('user', 'name email phone');
    
    if (!profile && user.role === 'partner' || user.role === 'partner') {
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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
      .populate('partner', 'name')
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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
    if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
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

// ===== NEW VENDOR SYSTEM FOR IN-STORE ONLY MODEL =====

// Vendor shop setup
router.post('/setup-shop', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const {
      shopName, ownerName, description, category,
      street, area, city, pincode, state,
      latitude, longitude, mapUrl,
      contactNumber, whatsappNumber,
      openTime, closeTime, workingDays, isOpen24x7
    } = req.body;

    if (!shopName || !street || !city || !pincode || !contactNumber) {
      return res.status(400).json({ 
        message: 'Shop name, address, city, pincode, and contact number are required' 
      });
    }

    // Update user with shop details
    await User.findByIdAndUpdate(user._id, {
      'shopDetails.shopName': shopName,
      'shopDetails.ownerName': ownerName || user.name,
      'shopDetails.description': description,
      'shopDetails.category': category,
      'shopDetails.address.street': street,
      'shopDetails.address.area': area,
      'shopDetails.address.city': city,
      'shopDetails.address.pincode': pincode,
      'shopDetails.address.state': state,
      'shopDetails.location.latitude': latitude,
      'shopDetails.location.longitude': longitude,
      'shopDetails.location.mapUrl': mapUrl,
      'shopDetails.contactNumber': contactNumber,
      'shopDetails.whatsappNumber': whatsappNumber,
      'shopDetails.timing.openTime': openTime,
      'shopDetails.timing.closeTime': closeTime,
      'shopDetails.timing.workingDays': workingDays,
      'shopDetails.timing.isOpen24x7': isOpen24x7
    });

    res.json({ success: true, message: 'Shop details updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get vendor dashboard for new system
router.get('/shop-dashboard', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    // Get product counts
    const totalProducts = await Product.countDocuments({ vendor: user._id });
    const activeProducts = await Product.countDocuments({ 
      vendor: user._id, 
      isPublished: true 
    });

    // Get purchase analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPurchases = await InStorePurchase.countDocuments({
      vendor: user._id,
      purchaseDate: { $gte: today }
    });

    // Get total coins redeemed and discount given
    const analytics = await InStorePurchase.aggregate([
      { $match: { vendor: user._id } },
      {
        $group: {
          _id: null,
          totalCoinsRedeemed: { $sum: '$coinsUsed' },
          totalDiscountGiven: { $sum: '$discountAmount' },
          totalPurchases: { $sum: 1 }
        }
      }
    ]);

    const stats = analytics[0] || {
      totalCoinsRedeemed: 0,
      totalDiscountGiven: 0,
      totalPurchases: 0
    };

    res.json({
      success: true,
      dashboard: {
        totalProducts,
        activeProducts,
        todayPurchases,
        totalCoinsRedeemed: stats.totalCoinsRedeemed,
        totalDiscountGiven: stats.totalDiscountGiven,
        totalPurchases: stats.totalPurchases
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm in-store purchase
router.post('/confirm-purchase', auth, async (req, res, next) => {
  try {
    const vendor = req.user;
    if (vendor.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const {
      userId, productId, coinsUsed, verificationCode, notes
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID required' });
    }

    // Get user and product
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!product || product.vendor.toString() !== vendor._id.toString()) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }

    // Check if user has enough coins
    if (coinsUsed > user.wallet.coins) {
      return res.status(400).json({ message: 'Insufficient coins in user wallet' });
    }

    // Check if coins requested exceed product's allowed discount
    if (coinsUsed > product.coinDiscount) {
      return res.status(400).json({ 
        message: `Maximum ${product.coinDiscount} coins can be used for this product` 
      });
    }

    // Calculate amounts
    const discountAmount = coinsUsed * product.coinConversionRate;
    const finalAmountPaid = Math.max(0, product.originalPrice - discountAmount);

    // Start transaction
    // Deduct coins from user wallet
    const balanceBefore = user.wallet.coins;
    const balanceAfter = balanceBefore - coinsUsed;
    
    await User.findByIdAndUpdate(userId, {
      'wallet.coins': balanceAfter,
      'wallet.totalSpent': user.wallet.totalSpent + coinsUsed
    });

    // Create wallet transaction
    await WalletTransaction.create({
      user: userId,
      vendor: vendor._id,
      product: productId,
      type: 'spent',
      amount: coinsUsed,
      description: `Discount used at ${vendor.shopDetails?.shopName || vendor.name}`,
      source: 'in_store_purchase',
      inStorePurchase: {
        productName: product.title,
        originalPrice: product.originalPrice,
        coinsUsed,
        discountAmount,
        finalAmountPaid,
        purchaseDate: new Date(),
        confirmedBy: vendor._id
      },
      balanceBefore,
      balanceAfter
    });

    // Create in-store purchase record
    await InStorePurchase.create({
      user: userId,
      vendor: vendor._id,
      product: productId,
      productName: product.title,
      originalPrice: product.originalPrice,
      coinsUsed,
      coinConversionRate: product.coinConversionRate,
      discountAmount,
      finalAmountPaid,
      confirmedBy: vendor._id,
      customerDetails: {
        name: user.name,
        phone: user.phone,
        email: user.email
      },
      verificationCode,
      vendorNotes: notes,
      status: 'completed'
    });

    // Update product and vendor analytics
    await Product.findByIdAndUpdate(productId, {
      $inc: {
        'analytics.totalCoinsUsed': coinsUsed,
        'analytics.totalInStorePurchases': 1
      }
    });

    await User.findByIdAndUpdate(vendor._id, {
      $inc: {
        'shopDetails.analytics.totalCoinsRedeemed': coinsUsed,
        'shopDetails.analytics.totalDiscountGiven': discountAmount
      }
    });

    res.json({
      success: true,
      message: 'Purchase confirmed successfully',
      purchase: {
        productName: product.title,
        originalPrice: product.originalPrice,
        coinsUsed,
        discountAmount,
        finalAmountPaid,
        customerName: user.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get vendor's purchase history
router.get('/shop-purchases', auth, async (req, res, next) => {
  try {
    const vendor = req.user;
    if (vendor.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const filter = { vendor: vendor._id };
    
    // Date filter
    if (req.query.from || req.query.to) {
      filter.purchaseDate = {};
      if (req.query.from) filter.purchaseDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.purchaseDate.$lte = new Date(req.query.to);
    }

    const [purchases, total] = await Promise.all([
      InStorePurchase.find(filter)
        .populate('user', 'name phone email')
        .populate('product', 'title images')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(limit),
      InStorePurchase.countDocuments(filter)
    ]);

    res.json({
      success: true,
      purchases,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
