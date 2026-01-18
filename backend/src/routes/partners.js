const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../schemas/User');
const { Product } = require('../schemas/Product');
const { Transaction } = require('../schemas/Transaction');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/uploadProduct');
const { emailOtpService } = require('../lib/emailOtpService');
const router = express.Router();

// Partner Registration with OTP verification
router.post('/register', uploadProduct.fields([
  { name: 'shopPhoto', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const {
      name, email, phone, password, otp,
      shopName, ownerName, description, category,
      street, area, city, pincode, state, country,
      latitude, longitude, mapUrl,
      contactNumber, whatsappNumber,
      openTime, closeTime, workingDays, isOpen24x7
    } = req.body;

    // Verify OTP first
    if (!otp || !email || !phone) {
      return res.status(400).json({ message: 'OTP, email, and phone are required' });
    }

    const isOtpValid = await emailOtpService.verifyOTP(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare shop details
    const shopDetails = {
      shopName,
      ownerName,
      description,
      category,
      address: {
        street,
        area,
        city,
        pincode,
        state,
        country: country || 'India'
      },
      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        mapUrl
      },
      contactNumber,
      whatsappNumber,
      timing: {
        openTime,
        closeTime,
        workingDays: workingDays ? JSON.parse(workingDays) : [],
        isOpen24x7: isOpen24x7 === 'true'
      },
      verification: {
        shopPhoto: req.files?.shopPhoto?.[0]?.path || null,
        idProof: req.files?.idProof?.[0]?.path || null,
        isVerified: false,
        approvalStatus: 'pending'
      }
    };

    // Create partner user
    const partner = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'Partner',
      shopDetails,
      isApproved: null, // Pending approval
      wallet: { coins: 0, totalEarned: 0, totalSpent: 0 }
    });

    res.status(201).json({
      message: 'Partner registration successful! Please wait for admin approval.',
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        shopName: partner.shopDetails.shopName,
        approvalStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get partner dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    // Get all products for this partner
    const products = await Product.find({ partner: req.user._id });
    
    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    
    // Get transaction data
    const transactions = await Transaction.find({
      partnerId: req.user._id,
      type: 'purchase'
    }).populate('userId', 'name email');

    const walletDiscountsGiven = transactions.reduce((sum, t) => sum + (t.coinsUsed || 0), 0);
    const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(t => 
      new Date(t.createdAt) >= today
    );
    const todayFootfall = todayTransactions.length;

    // Mock data for total visits (would need analytics tracking in real implementation)
    const totalVisits = products.reduce((sum, p) => sum + (p.views || 0), 0);

    res.json({
      totalProducts,
      activeProducts,
      totalVisits,
      walletDiscountsGiven,
      todayFootfall,
      totalEarnings,
      pendingApproval: req.user.isApproved === null ? 1 : 0,
      lowStockProducts: products.filter(p => p.stockQuantity && p.stockQuantity < 5).length
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Get partner notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const notifications = [];
    
    // Check for low stock products
    const lowStockProducts = await Product.find({
      partner: req.user._id,
      stockQuantity: { $lt: 5, $gt: 0 }
    });

    lowStockProducts.forEach(product => {
      notifications.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.stockQuantity} units left`,
        time: 'now'
      });
    });

    // Check approval status
    if (req.user.isApproved === null) {
      notifications.push({
        type: 'info',
        title: 'Pending Approval',
        message: 'Your partner application is under review',
        time: '1 hour ago'
      });
    } else if (req.user.isApproved === false) {
      notifications.push({
        type: 'error',
        title: 'Application Rejected',
        message: 'Your partner application has been rejected. Please contact support.',
        time: '2 hours ago'
      });
    }

    res.json(notifications);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Confirm purchase (POS system)
router.post('/confirm-purchase', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const {
      userId,
      productId,
      coinsUsed,
      finalAmountPaid,
      verificationCode,
      notes
    } = req.body;

    // Validate inputs
    if (!userId || !productId || coinsUsed < 0 || finalAmountPaid < 0) {
      return res.status(400).json({ message: 'Invalid purchase data' });
    }

    // Get user and product
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: 'User or product not found' });
    }

    // Verify product belongs to this partner
    if (product.partner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Product does not belong to this partner' });
    }

    // Check user has enough coins
    if (user.wallet.coins < coinsUsed) {
      return res.status(400).json({ message: 'User does not have enough coins' });
    }

    // Check coins don't exceed maximum discount
    if (coinsUsed > (product.discountCoins || 0)) {
      return res.status(400).json({ message: 'Coins exceed maximum discount allowed' });
    }

    // Calculate expected final amount
    const expectedFinalAmount = product.originalPrice - coinsUsed;
    if (Math.abs(finalAmountPaid - expectedFinalAmount) > 0.01) {
      return res.status(400).json({ message: 'Final amount mismatch' });
    }

    // Start transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Deduct coins from user
      user.wallet.coins -= coinsUsed;
      user.wallet.totalSpent += coinsUsed;
      await user.save({ session });

      // Add coins to partner (optional - for tracking)
      req.user.wallet = req.user.wallet || { coins: 0, totalEarned: 0, totalSpent: 0 };
      req.user.wallet.coins = (req.user.wallet.coins || 0) + coinsUsed;
      req.user.wallet.totalEarned = (req.user.wallet.totalEarned || 0) + coinsUsed;
      await req.user.save({ session });

      // Create transaction record
      const transaction = await Transaction.create([{
        userId: user._id,
        partnerId: req.user._id,
        productId: product._id,
        type: 'purchase',
        amount: product.originalPrice, // Original amount for revenue tracking
        coinsUsed,
        finalAmountPaid,
        verificationCode,
        notes,
        status: 'completed'
      }], { session });

      // Update product stock if applicable
      if (product.stockQuantity !== undefined && product.stockQuantity > 0) {
        product.stockQuantity -= 1;
        await product.save({ session });
      }

      await session.commitTransaction();

      res.json({
        message: 'Purchase confirmed successfully',
        purchase: {
          transactionId: transaction[0]._id,
          userName: user.name,
          productName: product.name,
          coinsUsed,
          finalAmountPaid,
          timestamp: new Date()
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error confirming purchase:', error);
    res.status(500).json({ message: 'Failed to confirm purchase' });
  }
});

// Get partner transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      partnerId: req.user._id,
      type: 'purchase'
    })
    .populate('userId', 'name email')
    .populate('productId', 'name category')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

    const total = await Transaction.countDocuments({
      partnerId: req.user._id,
      type: 'purchase'
    });

    const formattedTransactions = transactions.map(t => ({
      _id: t._id,
      userName: t.userId?.name || 'Unknown',
      userEmail: t.userId?.email || 'Unknown',
      productName: t.productId?.name || 'Unknown Product',
      category: t.productId?.category || 'Unknown',
      coinsUsed: t.coinsUsed || 0,
      finalAmount: t.finalAmountPaid || 0,
      originalPrice: t.amount || 0,
      date: t.createdAt.toLocaleDateString('en-IN'),
      timestamp: t.createdAt
    }));

    res.json({
      transactions: formattedTransactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Get partner reports
router.get('/reports', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const { range = '7days' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get transactions in range
    const transactions = await Transaction.find({
      partnerId: req.user._id,
      type: 'purchase',
      createdAt: { $gte: startDate }
    })
    .populate('userId', 'name email')
    .populate('productId', 'name category originalPrice');

    // Calculate overview stats
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalCoinsRedeemed = transactions.reduce((sum, t) => sum + (t.coinsUsed || 0), 0);
    const totalTransactions = transactions.length;

    // Get products for views calculation
    const products = await Product.find({ partner: req.user._id });
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

    // Daily stats for charts
    const dailyStats = [];
    const daysInRange = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysInRange; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = transactions.filter(t => 
        t.createdAt >= dayStart && t.createdAt <= dayEnd
      );

      dailyStats.push({
        date: date.toISOString(),
        revenue: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        coinsRedeemed: dayTransactions.reduce((sum, t) => sum + (t.coinsUsed || 0), 0),
        transactions: dayTransactions.length
      });
    }

    // Top products
    const productStats = {};
    transactions.forEach(t => {
      if (t.productId) {
        const productId = t.productId._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            productName: t.productId.name,
            category: t.productId.category,
            sales: 0,
            revenue: 0
          };
        }
        productStats[productId].sales += 1;
        productStats[productId].revenue += t.amount || 0;
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category distribution
    const categoryStats = {};
    products.forEach(p => {
      const category = p.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Purchase history for table
    const purchaseHistory = transactions.map(t => ({
      _id: t._id,
      customerName: t.userId?.name || 'Unknown',
      customerEmail: t.userId?.email || 'Unknown',
      productName: t.productId?.name || 'Unknown Product',
      category: t.productId?.category || 'Unknown',
      coinsUsed: t.coinsUsed || 0,
      finalAmount: t.finalAmountPaid || 0,
      originalPrice: t.amount || 0,
      date: t.createdAt
    }));

    res.json({
      overview: {
        totalRevenue,
        totalCoinsRedeemed,
        totalViews,
        totalTransactions,
        categoryDistribution
      },
      dailyStats,
      topProducts,
      purchaseHistory: purchaseHistory.slice(0, 10), // Latest 10 for table
      productViews: [], // Would need analytics tracking
      coinsRedeemed: dailyStats.map(d => ({
        date: d.date,
        coins: d.coinsRedeemed
      }))
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ message: 'Failed to generate reports' });
  }
});

// Get all approved partner stores (public)
router.get('/stores', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      category, 
      location, 
      sort = 'name' 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    const query = { 
      role: 'Partner', 
      isApproved: true,
      'shopDetails.shopName': { $exists: true }
    };
    
    if (search) {
      query.$or = [
        { 'shopDetails.shopName': { $regex: search, $options: 'i' } },
        { 'shopDetails.ownerName': { $regex: search, $options: 'i' } },
        { 'shopDetails.description': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query['shopDetails.category'] = category;
    }
    
    if (location) {
      query['shopDetails.address.city'] = { $regex: location, $options: 'i' };
    }

    // Sort options
    let sortQuery = {};
    switch (sort) {
      case 'name':
        sortQuery = { 'shopDetails.shopName': 1 };
        break;
      case 'category':
        sortQuery = { 'shopDetails.category': 1 };
        break;
      case 'createdAt':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { 'shopDetails.shopName': 1 };
    }

    const stores = await User.find(query)
      .select('shopDetails isApproved createdAt')
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      stores,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Get specific store details (public)
router.get('/:partnerId/store', async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const store = await User.findOne({
      _id: partnerId,
      role: 'Partner',
      isApproved: true
    }).select('shopDetails name email isApproved');

    if (!store) {
      return res.status(404).json({ message: 'Store not found or not approved' });
    }

    res.json(store);

  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).json({ message: 'Failed to fetch store details' });
  }
});

module.exports = router;