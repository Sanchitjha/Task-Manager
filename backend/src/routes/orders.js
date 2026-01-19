const express = require('express');
const mongoose = require('mongoose');
const { Product } = require('../schemas/Product');
const { Order } = require('../schemas/Order');
const { User } = require('../schemas/User');
const { Transaction } = require('../schemas/Transaction');
const { auth } = require('../middleware/auth');
const { ReceiptGenerator } = require('../lib/receiptGenerator');

const router = express.Router();

// Create new order with coin payment and receipt generation
router.post('/', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = req.user;
    const { items, shippingAddress, notes } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    let orderItems = [];
    let totalOriginalAmount = 0;
    let totalDiscountAmount = 0;
    let totalFinalAmount = 0;
    let totalCoinsUsed = 0;
    let vendorId = null;
    let coinConversionRate = 1;

    // Process each item and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      if (!product.isPublished) {
        throw new Error(`Product ${product.title} is not available`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stock}`);
      }

      // Set Partner (all items should be from same Partner for this order)
      if (!vendorId) {
        vendorId = product.vendor;
        coinConversionRate = product.coinConversionRate || 1;
      } else if (vendorId.toString() !== product.vendor.toString()) {
        throw new Error('All items in an order must be from the same Partner');
      }

      const quantity = parseInt(item.quantity);
      const originalPrice = product.originalPrice || 0;
      const discountAmount = Math.round((originalPrice * product.discountPercentage) / 100);
      const finalPrice = originalPrice - discountAmount;
      const coinPrice = Math.ceil(finalPrice / coinConversionRate);

      const itemTotal = {
        product: product._id,
        productSnapshot: {
          title: product.title,
          description: product.description,
          originalPrice: originalPrice,
          discountPercentage: product.discountPercentage,
          finalPrice: finalPrice,
          coinPrice: coinPrice,
          images: product.images
        },
        quantity: quantity,
        unitOriginalPrice: originalPrice,
        unitDiscountAmount: discountAmount,
        unitFinalPrice: finalPrice,
        unitCoinPrice: coinPrice,
        totalOriginalPrice: originalPrice * quantity,
        totalDiscountAmount: discountAmount * quantity,
        totalFinalPrice: finalPrice * quantity,
        totalCoinsPaid: coinPrice * quantity
      };

      orderItems.push(itemTotal);
      
      totalOriginalAmount += itemTotal.totalOriginalPrice;
      totalDiscountAmount += itemTotal.totalDiscountAmount;
      totalFinalAmount += itemTotal.totalFinalPrice;
      totalCoinsUsed += itemTotal.totalCoinsPaid;

      // Reduce product stock
      product.stock -= quantity;
      await product.save({ session });
    }

    // Check if user has enough coins
    if (user.coinsBalance < totalCoinsUsed) {
      throw new Error(`Insufficient coins. Required: ${totalCoinsUsed}, Available: ${user.coinsBalance}`);
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderId,
      customer: user._id,
      vendor: vendorId,
      items: orderItems,
      totalOriginalAmount,
      totalDiscountAmount,
      totalFinalAmount,
      totalCoinsUsed,
      coinConversionRate,
      shippingAddress: shippingAddress || {
        fullName: user.name,
        phone: user.phone || '',
        email: user.email,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      notes,
      paymentStatus: 'paid',
      paymentMethod: 'coins',
      orderStatus: 'confirmed'
    });

    await order.save({ session });

    // Update user's coin balance
    user.coinsBalance -= totalCoinsUsed;
    await user.save({ session });

    // Get Partner for receipt
    const vendor = await User.findById(vendorId).session(session);
    
    // Update Partner's coin balance (transfer coins from customer)
    if (vendor) {
      vendor.coinsBalance = (vendor.coinsBalance || 0) + totalCoinsUsed;
      await vendor.save({ session });

      // Create transaction records
      await Transaction.create([
        {
          userId: user._id,
          type: 'purchase',
          amount: -totalCoinsUsed,
          description: `Order payment: ${orderId}`,
          metadata: {
            orderId: order._id,
            vendorId: vendorId,
            itemCount: orderItems.length
          }
        },
        {
          userId: vendorId,
          type: 'sale',
          amount: totalCoinsUsed,
          description: `Order received: ${orderId}`,
          metadata: {
            orderId: order._id,
            customerId: user._id,
            itemCount: orderItems.length
          }
        }
      ], { session });
    }

    // Generate receipt
    try {
      const receiptData = await ReceiptGenerator.generateReceipt(
        await order.populate([
          { path: 'items.product', model: 'Product' },
          { path: 'customer', model: 'User' },
          { path: 'partner', model: 'User' }
        ]),
        user,
        vendor
      );

      order.receiptGenerated = true;
      order.receiptUrl = receiptData.receiptUrl;
      order.receiptNumber = receiptData.receiptNumber;
      await order.save({ session });

    } catch (receiptError) {
      console.error('Receipt generation failed:', receiptError);
      // Don't fail the order if receipt generation fails
    }

    await session.commitTransaction();
    session.endSession();

    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('partner', 'name email vendorAddress')
      .populate('customer', 'name email')
      .populate('items.product', 'title images');

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: `Order placed successfully! ${totalCoinsUsed} coins transferred to Partner.`
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Order creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    const filter = { customer: req.user._id };
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('partner', 'name email vendorAddress')
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get Partner's orders
router.get('/partner-orders', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'partner' && user.role !== 'partner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    const filter = { vendor: req.user._id };
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('partner', 'name email')
        .populate('items.product', 'title originalPrice finalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);
    
    res.json({ 
      success: true, 
      orders,
      total,
      page,
      pages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/:orderId', auth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('partner', 'name email vendorAddress')
      .populate('customer', 'name email phone')
      .populate('items.product', 'title images description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isPartner = order.vendor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isPartner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Update order status (Partner only)
router.put('/:orderId/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is Partner of this order or admin
    const isPartner = order.vendor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPartner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: req.body.note || `Status updated to ${status}`
    });

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Download receipt
router.get('/:orderId/receipt', auth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isPartner = order.vendor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isPartner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.receiptGenerated || !order.receiptUrl) {
      return res.status(404).json({ message: 'Receipt not available' });
    }

    res.json({
      success: true,
      receiptUrl: order.receiptUrl,
      receiptNumber: order.receiptNumber
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;