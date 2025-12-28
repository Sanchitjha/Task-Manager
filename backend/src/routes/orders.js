const express = require('express');
const { Order } = require('../schemas/Order');
const { Product } = require('../schemas/Product');
const { User } = require('../schemas/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('vendor', 'name email')
      .populate('items.product', 'title price category')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, customer, totalAmount, paymentMethod, notes } = req.body;
    
    // Validate items and check stock
    const orderItems = [];
    let calculatedTotal = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.product}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
      }
      
      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        vendor: product.vendor
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Check user's coin balance
    const user = await User.findById(req.user.id);
    const userCoinsBalance = user.coinsBalance || 0;
    
    if (userCoinsBalance < calculatedTotal) {
      // Revert stock changes
      for (const item of items) {
        const product = await Product.findById(item.product);
        product.stock += item.quantity;
        await product.save();
      }
      return res.status(400).json({ 
        error: `Insufficient coins. You have ${userCoinsBalance} coins but need ${calculatedTotal} coins.` 
      });
    }

    // Generate unique order ID
    const orderId = `ORD-${new Date().getFullYear()}-${Date.now()}`;
    
    // Create order
    const order = new Order({
      orderId,
      customer: req.user.id,
      vendor: orderItems[0].vendor, // Assuming single vendor for now
      items: orderItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity
      })),
      totalAmount: calculatedTotal,
      finalAmount: calculatedTotal,
      shippingAddress: {
        fullName: customer.name,
        phone: customer.phone,
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.pincode,
        country: 'India'
      },
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      notes: notes || ''
    });
    
    await order.save();
    
    // Deduct coins from user
    user.coinsBalance = (user.coinsBalance || 0) - calculatedTotal;
    await user.save();

    // Create transaction record
    const { Transaction } = require('../schemas/Transaction');
    const transaction = new Transaction({
      user: req.user.id,
      type: 'debit',
      amount: calculatedTotal,
      description: `Purchase order ${orderId}`,
      orderId: order._id,
      status: 'completed'
    });
    await transaction.save();
    
    // Transfer coins to vendors
    const vendorPayouts = {};
    for (const item of orderItems) {
      if (vendorPayouts[item.vendor]) {
        vendorPayouts[item.vendor] += item.price * item.quantity;
      } else {
        vendorPayouts[item.vendor] = item.price * item.quantity;
      }
    }
    
    for (const [vendorId, amount] of Object.entries(vendorPayouts)) {
      const vendor = await User.findById(vendorId);
      if (vendor) {
        vendor.walletBalance += amount;
        await vendor.save();
      }
    }
    
    res.json({ 
      success: true, 
      order,
      orderId: order.orderId,
      message: 'Order placed successfully',
      coinsDeducted: calculatedTotal,
      remainingBalance: user.coinsBalance
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.user': req.user.id })
      .populate('items.product', 'title price category images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get vendor's orders
router.get('/vendor-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vendor access required' });
    }
    
    const orders = await Order.find({
      'items.vendor': req.user.id
    }).populate('customer.user', 'name email phone')
      .populate('items.product', 'title price category images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (vendor/admin only)
router.patch('/:orderId', auth, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user can update this order
    const canUpdate = req.user.role === 'admin' || 
                     order.items.some(item => item.vendor.toString() === req.user.id);
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }
    
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer.user', 'name email phone')
      .populate('items.product', 'title price category images')
      .populate('items.vendor', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user can view this order
    const canView = req.user.role === 'admin' || 
                   order.customer.user.toString() === req.user.id ||
                   order.items.some(item => item.vendor._id.toString() === req.user.id);
    
    if (!canView) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;