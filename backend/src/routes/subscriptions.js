const express = require('express');
const mongoose = require('mongoose');
const { ProductSubscription } = require('../schemas/ProductSubscription');
const { Product } = require('../schemas/Product');
const { User } = require('../schemas/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ===== PARTNER SUBSCRIPTION ROUTES =====

// Calculate subscription cost (before creating product)
router.post('/calculate', auth, async (req, res, next) => {
  try {
    const { numberOfImages, numberOfDays } = req.body;
    
    if (!numberOfImages || !numberOfDays) {
      return res.status(400).json({ message: 'Number of images and days are required' });
    }
    
    const pricePerImagePerDay = 1; // ₹1 per image per day
    const totalAmount = ProductSubscription.calculateAmount(numberOfImages, numberOfDays, pricePerImagePerDay);
    
    res.json({
      success: true,
      calculation: {
        numberOfImages,
        numberOfDays,
        pricePerImagePerDay,
        totalAmount,
        breakdown: `${numberOfImages} images × ${numberOfDays} days × ₹${pricePerImagePerDay} = ₹${totalAmount}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create subscription for a product (after product creation)
router.post('/create', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor/Partner access required' });
    }

    const { productId, numberOfDays, paymentMethod = 'online', transactionId } = req.body;
    
    if (!productId || !numberOfDays) {
      return res.status(400).json({ message: 'Product ID and number of days are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized for this product' });
    }

    const numberOfImages = product.images.length;
    if (numberOfImages === 0) {
      return res.status(400).json({ message: 'Product must have at least one image' });
    }

    const pricePerImagePerDay = 1;
    const totalAmount = ProductSubscription.calculateAmount(numberOfImages, numberOfDays, pricePerImagePerDay);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + numberOfDays);

    // Create subscription
    const subscription = new ProductSubscription({
      product: productId,
      vendor: user._id,
      numberOfDays,
      numberOfImages,
      pricePerImagePerDay,
      totalAmount,
      startDate,
      endDate,
      paymentStatus: 'pending',
      paymentMethod,
      transactionId,
      status: 'pending'
    });

    await subscription.save();

    res.json({
      success: true,
      subscription,
      message: 'Subscription created. Please complete payment to activate.',
      paymentRequired: totalAmount
    });
  } catch (error) {
    next(error);
  }
});

// Complete payment for subscription
router.post('/:subscriptionId/pay', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = req.user;
    const { subscriptionId } = req.params;
    const { transactionId, paymentMethod = 'online' } = req.body;

    const subscription = await ProductSubscription.findById(subscriptionId).session(session);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new Error('Not authorized');
    }

    if (subscription.paymentStatus === 'paid') {
      throw new Error('Subscription already paid');
    }

    // Update subscription payment status
    subscription.paymentStatus = 'paid';
    subscription.paymentDate = new Date();
    subscription.paymentMethod = paymentMethod;
    subscription.transactionId = transactionId || `TXN-${Date.now()}`;
    subscription.status = 'active';
    await subscription.save({ session });

    // Update product
    const product = await Product.findById(subscription.product).session(session);
    if (product) {
      product.isPublished = true;
      product.currentSubscription = subscription._id;
      product.subscriptionExpiry = subscription.endDate;
      if (!product.subscriptionHistory) {
        product.subscriptionHistory = [];
      }
      product.subscriptionHistory.push(subscription._id);
      await product.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Payment successful! Your product is now live.',
      subscription,
      expiryDate: subscription.endDate
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// Get Partner's subscriptions
router.get('/vendor-subscriptions', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Vendor/Partner access required' });
    }

    const status = req.query.status; // active, expired, pending, cancelled
    const filter = { vendor: user._id, isDeleted: false };
    if (status) filter.status = status;

    const subscriptions = await ProductSubscription.find(filter)
      .populate('product', 'title images category')
      .sort({ createdAt: -1 })
      .lean();

    // Add days remaining for active subscriptions
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        const now = new Date();
        const diff = new Date(sub.endDate) - now;
        sub.daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }
    });

    res.json({ success: true, subscriptions });
  } catch (error) {
    next(error);
  }
});

// Renew subscription
router.post('/:subscriptionId/renew', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = req.user;
    const { subscriptionId } = req.params;
    const { numberOfDays, transactionId } = req.body;

    if (!numberOfDays) {
      throw new Error('Number of days is required for renewal');
    }

    const oldSubscription = await ProductSubscription.findById(subscriptionId).session(session);
    if (!oldSubscription) {
      throw new Error('Subscription not found');
    }

    if (oldSubscription.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new Error('Not authorized');
    }

    const product = await Product.findById(oldSubscription.product).session(session);
    if (!product) {
      throw new Error('Product not found');
    }

    const numberOfImages = product.images.length;
    const totalAmount = ProductSubscription.calculateAmount(numberOfImages, numberOfDays, 1);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + numberOfDays);

    // Create new subscription
    const newSubscription = new ProductSubscription({
      product: product._id,
      vendor: user._id,
      numberOfDays,
      numberOfImages,
      pricePerImagePerDay: 1,
      totalAmount,
      startDate,
      endDate,
      paymentStatus: 'paid',
      paymentDate: new Date(),
      transactionId: transactionId || `TXN-RENEW-${Date.now()}`,
      status: 'active',
      renewalCount: oldSubscription.renewalCount + 1,
      previousSubscription: oldSubscription._id
    });

    await newSubscription.save({ session });

    // Update old subscription
    oldSubscription.status = 'expired';
    await oldSubscription.save({ session });

    // Update product
    product.isPublished = true;
    product.currentSubscription = newSubscription._id;
    product.subscriptionExpiry = newSubscription.endDate;
    product.subscriptionHistory.push(newSubscription._id);
    await product.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Subscription renewed successfully!',
      subscription: newSubscription
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// ===== ADMIN SUBSCRIPTION ROUTES =====

// Get all subscriptions (Admin only)
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const vendorId = req.query.vendorId;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (vendorId) filter.vendor = vendorId;

    const [subscriptions, total] = await Promise.all([
      ProductSubscription.find(filter)
        .populate('product', 'title images category')
        .populate('vendor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductSubscription.countDocuments(filter)
    ]);

    // Calculate stats
    const stats = await ProductSubscription.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      subscriptions,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats
    });
  } catch (error) {
    next(error);
  }
});

// Delete subscription (Admin only)
router.delete('/admin/:subscriptionId', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = req.user;
    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { subscriptionId } = req.params;
    const subscription = await ProductSubscription.findById(subscriptionId).session(session);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Mark as deleted
    subscription.isDeleted = true;
    subscription.deletedBy = user._id;
    subscription.deletedAt = new Date();
    subscription.status = 'cancelled';
    await subscription.save({ session });

    // Unpublish the product
    const product = await Product.findById(subscription.product).session(session);
    if (product) {
      product.isPublished = false;
      product.currentSubscription = null;
      await product.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Subscription deleted and product unpublished'
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

module.exports = router;
